import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";

import { GetUserWithAccessToken } from "../../jwt/user.ts";
import {
    AddTeamMember,
    CreateTeam,
    DeleteTeam,
    GetTeam,
    GetTeamMembers,
    GetTeams,
    GetTeamsCount,
    RemoveTeamMember,
    Role,
    SearchTeams,
    Team,
    UpdateTeam,
} from "../../database/entities/team.ts";
import { getQuery } from "https://deno.land/x/oak@v10.1.0/helpers.ts";

const router = new Router({ prefix: `${Prefix}/teams` });

router.post("/", async (ctx) => {
    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const body = await ParseBodyJSON<{ name: string; description: string }>(ctx);

    const team = await CreateTeam(ctx.app.state.pool, body.name, body.description, user.id);

    SendJSONResponse(ctx, team, 201);
});

router.get("/:id", async (ctx) => {
    if (ctx.params.id == undefined) return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const team = await GetTeam(ctx.app.state.pool, parseInt(ctx.params.id, 10));
    if (!team) return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    SendJSONResponse(ctx, team, 200);
});

router.patch("/:id", async (ctx) => {
    if (ctx.params.id == undefined) return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const body = await ParseBodyJSON<{ name: string; description: string }>(ctx);

    const members = await GetTeamMembers(ctx.app.state.pool, parseInt(ctx.params.id, 10));
    if (!members) return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    if (
        !user.admin &&
        !members.some((member) => member.user.id == user.id && member.role == Role.LEADER)
    )
        return SendJSONResponse(ctx, { message: "Forbidden, must be leader or admin" }, 403);

    const updatedTeam = await UpdateTeam(
        ctx.app.state.pool,
        parseInt(ctx.params.id, 10),
        body.name,
        body.description
    );

    SendJSONResponse(ctx, updatedTeam, 200);
});

router.delete("/:id", async (ctx) => {
    if (ctx.params.id == undefined) return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const members = await GetTeamMembers(ctx.app.state.pool, parseInt(ctx.params.id, 10));
    if (!members) return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    if (
        !user.admin &&
        !members.some((member) => member.user.id == user.id && member.role == Role.LEADER)
    )
        return SendJSONResponse(ctx, { message: "Forbidden, must be leader or admin" }, 403);

    const deletedTeam = await DeleteTeam(ctx.app.state.pool, parseInt(ctx.params.id, 10));

    SendJSONResponse(ctx, deletedTeam, 200);
});

router.get("/:id/users", async (ctx) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const members = await GetTeamMembers(ctx.app.state.pool, id);

    console.log(members)

    if (!members) return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    return SendJSONResponse(ctx, members, 200);
});

router.put("/:id/users/:user_id", async (ctx) => {
    const team_id = parseInt(ctx.params.id, 10);
    const user_id = parseInt(ctx.params.user_id, 10);

    if (isNaN(team_id) || isNaN(user_id))
        return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const members = await GetTeamMembers(ctx.app.state.pool, parseInt(ctx.params.id, 10));
    if (!members) return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    if (
        !user.admin &&
        !members.some((member) => member.user.id == user.id && member.role == Role.LEADER)
    )
        return SendJSONResponse(ctx, { message: "Forbidden, must be leader or admin" }, 403);

    const body = await ParseBodyJSON<{ role: Role }>(ctx);

    // si on doit l’ajouter
    if (!members.some((member) => member.user.id == user_id))
        await AddTeamMember(ctx.app.state.pool, team_id, user_id, body.role);

    return SendJSONResponse(ctx, { message: "OK" }, 200);
});

router.delete("/:id/users/:user_id", async (ctx) => {
    const team_id = parseInt(ctx.params.id, 10);
    const user_id = parseInt(ctx.params.user_id, 10);

    if (isNaN(team_id) || isNaN(user_id))
        return SendJSONResponse(ctx, { message: "Invalid ID" }, 400);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    const members = await GetTeamMembers(ctx.app.state.pool, parseInt(ctx.params.id, 10));
    if (!members) return SendJSONResponse(ctx, { message: "Team not found" }, 404);

    // The user doing the requestg must be the leader of the team, an admin or the user to delete
    if (
        !user.admin &&
        !members.some((member) => member.user.id == user.id && member.role == Role.LEADER) &&
        user.id != user_id
    )
        return SendJSONResponse(ctx, { message: "Forbidden, must be leader or admin" }, 403);

    const _deletedTeamMember = await RemoveTeamMember(ctx.app.state.pool, team_id, user_id);

    return SendJSONResponse(ctx, { message: "Team member deleted" }, 200);
});

router.get("/", async (ctx) => {
    const queryParams = getQuery(ctx);

    let limit = parseInt(queryParams.limit, 10);
    if (isNaN(limit) || limit > 200) limit = 200; // max 200 teams

    let offset = parseInt(queryParams.offset, 10);
    if (isNaN(offset)) offset = 0;

    const search = queryParams.search;

    let teams: Team[] = [];
    if (search == undefined || search == "") {
        teams = await GetTeams(ctx.app.state.pool, limit, offset);
    } else {
        teams = await SearchTeams(ctx.app.state.pool, search, limit, offset);
    }
    let total = -1;
    try {
        total = await GetTeamsCount(ctx.app.state.pool);
    } catch (e) {
        console.log(e);
    }

    return SendJSONResponse(ctx, { teams, total });
});

export { router as Teams };
