import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";

import { GetUserWithAccessToken } from "../../jwt/user.ts";

import {
    CreateMatch,
    DeleteMatch,
    GetMatch,
    MatchStatus,
    UpdateMatch,
} from "../../database/entities/matches.ts";
import { GetTournamentOrganizers } from "../../database/entities/tournaments.ts";
import { UpdateTournamentMatches } from "../../tournaments/update.ts";

/**
 * 
 * This router handles all requests to the /matches endpoint.
 * 
 */
const router = new Router({ prefix: `${Prefix}/matches` });

router.get("/:id", async (ctx) => {
    const match_id = parseInt(ctx.params.id, 10);
    if (isNaN(match_id)) return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const match = await GetMatch(ctx.app.state.pool, match_id);
    if (!match) return SendJSONResponse(ctx, { message: "Match not found" }, 404);

    SendJSONResponse(ctx, match, 200);
});

router.patch("/:id", async (ctx) => {
    const match_id = parseInt(ctx.params.id, 10);
    if (isNaN(match_id)) return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );
    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const match = await GetMatch(ctx.app.state.pool, match_id);
    if (!match) return SendJSONResponse(ctx, { message: "Match not found" }, 404);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, match.tournament_id);
    if (!organizers.find((o) => o.id === user.id) && !user.admin)
        return SendJSONResponse(ctx, { message: "Forbidden" }, 403);

    const body = await ParseBodyJSON<{
        team1_id?: number;
        team2_id?: number;
        date?: number;
        row?: number;
        column?: number;
        status?: number;
    }>(ctx);

    if (body.team1_id !== undefined) match.team1_id = body.team1_id;
    if (body.team2_id !== undefined) match.team2_id = body.team2_id;
    if (body.date !== undefined) match.date = new Date(body.date);
    if (body.row !== undefined) match.row = body.row;
    if (body.column !== undefined) match.column = body.column;
    if (body.status !== undefined) match.status = body.status;

    await UpdateMatch(
        ctx.app.state.pool,
        match.id,
        match.team1_id,
        match.team2_id,
        match.row,
        match.column,
        match.tournament_id,
        match.status,
        match.date
    );

    if (body.status == MatchStatus.Team1Won || body.status == MatchStatus.Team2Won)
        await UpdateTournamentMatches(ctx.app.state.pool, match);

    SendJSONResponse(ctx, match, 200);
});

router.delete("/:id", async (ctx) => {
    const match_id = parseInt(ctx.params.id, 10);
    if (isNaN(match_id)) return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );
    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const match = await GetMatch(ctx.app.state.pool, match_id);
    if (!match) return SendJSONResponse(ctx, { message: "Match not found" }, 404);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, match.tournament_id);
    if (!organizers.find((o) => o.id === user.id) && !user.admin)
        return SendJSONResponse(ctx, { message: "Forbidden" }, 403);

    await DeleteMatch(ctx.app.state.pool, match_id);

    SendJSONResponse(ctx, { message: "Match deleted" }, 200);
});

router.post("/", async (ctx) => {
    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );
    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);
    
    const body = await ParseBodyJSON<{
        team1_id: number;
        team2_id: number;
        row: number;
        column: number;
        tournament_id: number;
        status: number;
        date: number;
    }>(ctx);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, body.tournament_id);
    if (!organizers.find((o) => o.id === user.id) && !user.admin)
        return SendJSONResponse(ctx, { message: "Forbidden for this tournament" }, 403);

    const match = await CreateMatch(
        ctx.app.state.pool,
        body.team1_id,
        body.team2_id,
        body.row,
        body.column,
        body.tournament_id,
        body.status,
        new Date(body.date)
    );

    SendJSONResponse(ctx, match, 201);
});

export { router as Matches };
