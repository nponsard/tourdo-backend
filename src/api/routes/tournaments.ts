import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";

import { GetUserWithAccessToken } from "../../jwt/user.ts";
import {
    AddOrganizer,
    CreateTournament,
    DeleteTournament,
    GetTournament,
    GetTournamentOrganizers,
    TournamentStatus,
    TournamentType,
    UpdateTournament,
} from "../../database/entities/tournaments.ts";

const router = new Router({ prefix: `${Prefix}/tournaments` });

router.post("/", async (ctx) => {
    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const body = await ParseBodyJSON<{
        type: number;
        name: string;
        description: string;
        start_date: number;
        end_date: number;
        max_teams: number;
        game_name: string;
    }>(ctx);

    const tournament = await CreateTournament(
        ctx.app.state.pool,
        body.type,
        body.name,
        body.description,
        new Date(body.start_date),
        new Date(body.end_date),
        body.max_teams,
        body.game_name
    );

    try {
        const _organizer = AddOrganizer(ctx.app.state.pool, tournament.id, user.id);
    } catch (e) {
        // prevent a tournament from being created without an organizer

        await DeleteTournament(ctx.app.state.pool, tournament.id);

        console.error("Error when adding organizer : ", e);

        return SendJSONResponse(ctx, { message: "Failed to create tournament" }, 500);
    }

    SendJSONResponse(ctx, tournament, 201);
});

router.delete("/:id", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizer = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    if (!user.admin && !organizer.some((u) => u.id === user.id))
        return SendJSONResponse(ctx, { message: "Forbidden, must be organizer or admin" }, 403);

    const tournament = await DeleteTournament(ctx.app.state.pool, tournament_id);

    SendJSONResponse(ctx, tournament, 200);
});

router.get("/:id", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);

    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const tournament = await GetTournament(ctx.app.state.pool, tournament_id);

    SendJSONResponse(ctx, tournament, 200);
});

router.patch("/:id", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizer = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    if (!user.admin && !organizer.some((u) => u.id === user.id))
        return SendJSONResponse(ctx, { message: "Forbidden, must be organizer or admin" }, 403);

    const old_tournament = await GetTournament(ctx.app.state.pool, tournament_id);

    const body = await ParseBodyJSON<{
        type?: TournamentType;
        name?: string;
        description?: string;
        start_date?: Date;
        end_date?: Date;
        max_teams?: number;
        game_name?: string;
        status?: TournamentStatus;
    }>(ctx);

    const newTournament = old_tournament;

    // update fields

    if (body.type !== undefined) newTournament.type = body.type;
    if (body.name !== undefined) newTournament.name = body.name;
    if (body.description !== undefined) newTournament.description = body.description;
    if (body.start_date !== undefined) newTournament.start_date = body.start_date;
    if (body.end_date !== undefined) newTournament.end_date = body.end_date;
    if (body.max_teams !== undefined) newTournament.max_teams = body.max_teams;
    if (body.game_name !== undefined) newTournament.game_name = body.game_name;
    if (body.status !== undefined) newTournament.status = body.status;

    const tournament = await UpdateTournament(
        ctx.app.state.pool,
        newTournament.id,
        newTournament.type,
        newTournament.name,
        newTournament.description,
        newTournament.start_date,
        newTournament.end_date,
        newTournament.max_teams,
        newTournament.game_name
    );

    SendJSONResponse(ctx, tournament, 200);
});

export { router as Tournaments };
