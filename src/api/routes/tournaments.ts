import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";

import { GetUserWithAccessToken } from "../../jwt/user.ts";
import {
    AddOrganizer,
    CreateTournament,
    DeleteTournament,
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






export { router as Tournaments };
