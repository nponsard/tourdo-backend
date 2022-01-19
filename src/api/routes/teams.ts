import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";

import { GetUserWithAccessToken } from "../../jwt/user.ts";
import {
    AddTeamMember,
    CreateTeam,
    Role,
} from "../../database/entities/team.ts";

const router = new Router({ prefix: `${Prefix}/teams` });

router.post("/", async (ctx) => {
    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const body = await ParseBodyJSON<{ name: string; description: string }>(
        ctx
    );

    const team = await CreateTeam(
        ctx.app.state.pool,
        body.name,
        body.description,
        user.id
    );

    SendJSONResponse(ctx, team, 201);
});

export { router as Teams };
