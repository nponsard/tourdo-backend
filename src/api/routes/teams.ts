import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";

import { GetUserWithAccessToken } from "../../jwt/user.ts";
import {
    CreateTeam,
    DeleteTeam,
    GetTeam,
    GetTeamMembers,
    Role,
    UpdateTeam,
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

router.get("/:id", async (ctx) => {
    if (ctx.params.id == undefined)
        return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const team = await GetTeam(ctx.app.state.pool, parseInt(ctx.params.id, 10));
    if (!team) return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    SendJSONResponse(ctx, team, 200);
});

router.patch("/:id", async (ctx) => {
    if (ctx.params.id == undefined)
        return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const body = await ParseBodyJSON<{ name: string; description: string }>(
        ctx
    );

    const members = await GetTeamMembers(
        ctx.app.state.pool,
        parseInt(ctx.params.id, 10)
    );
    if (!members)
        return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    if (
        !user.admin &&
        !members.some(
            (member) => member.user_id == user.id && member.role == Role.LEADER
        )
    )
        return SendJSONResponse(
            ctx,
            { message: "Forbidden, must be leader or admin" },
            403
        );

    const updatedTeam = await UpdateTeam(
        ctx.app.state.pool,
        parseInt(ctx.params.id, 10),
        body.name,
        body.description
    );

    SendJSONResponse(ctx, updatedTeam, 200);
});

router.delete("/:id", async (ctx) => {
    if (ctx.params.id == undefined)
        return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const members = await GetTeamMembers(
        ctx.app.state.pool,
        parseInt(ctx.params.id, 10)
    );
    if (!members)
        return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    if (
        !user.admin &&
        !members.some(
            (member) => member.user_id == user.id && member.role == Role.LEADER
        )
    )
        return SendJSONResponse(
            ctx,
            { message: "Forbidden, must be leader or admin" },
            403
        );

    const deletedTeam = await DeleteTeam(
        ctx.app.state.pool,
        parseInt(ctx.params.id, 10)
    );

    SendJSONResponse(ctx, deletedTeam, 200);
});

router.get("/:id/users", async (ctx) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const members = await GetTeamMembers(ctx.app.state.pool, id);
    if (!members)
        return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    return SendJSONResponse(ctx, members, 200);
});

export { router as Teams };
