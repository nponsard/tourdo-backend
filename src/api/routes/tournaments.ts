import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";

import { GetUserWithAccessToken } from "../../jwt/user.ts";
import {
    AddOrganizer,
    AddTournamentTeam,
    ChangeTeamNumber,
    CreateTournament,
    DeleteTournament,
    DeleteTournamentMatches,
    GetTournament,
    GetTournamentExactName,
    GetTournamentMatches,
    GetTournamentOrganizers,
    GetTournaments,
    GetTournamentsCount,
    GetTournamentTeams,
    RemoveOrganizer,
    RemoveTournamentTeam,
    SearchTournaments,
    Tournament,
    TournamentStatus,
    TournamentType,
    UpdateTournament,
} from "../../database/entities/tournaments.ts";
import { getQuery } from "https://deno.land/x/oak@v10.1.0/helpers.ts";
import { ShuffleTournamentTeams } from "../../tournaments/shuffle.ts";
import { GenerateMatches } from "../../tournaments/generate.ts";
import { CreateMatch, MatchStatus } from "../../database/entities/matches.ts";

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

    if (body.name.length < 3) return SendJSONResponse(ctx, { message: "Invalid name" }, 400);

    const exists = await GetTournamentExactName(ctx.app.state.pool, body.name);

    if (exists)
        return SendJSONResponse(ctx, { message: "Tournament with this name already exists" }, 409);

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

    if (!tournament) return SendJSONResponse(ctx, { message: "Tournament not found" }, 404);

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

    if (newTournament.name.length < 3)
        return SendJSONResponse(ctx, { message: "Invalid name" }, 400);

    const tournament = await UpdateTournament(
        ctx.app.state.pool,
        newTournament.id,
        newTournament.type,
        newTournament.status,
        newTournament.name,
        newTournament.description,
        newTournament.start_date,
        newTournament.end_date,
        newTournament.max_teams,
        newTournament.game_name
    );

    SendJSONResponse(ctx, tournament, 200);
});

router.get("/", async (ctx) => {
    const queryParams = getQuery(ctx);

    let limit = parseInt(queryParams.limit, 10);
    if (isNaN(limit) || limit > 200) limit = 200; // max 200 users

    let offset = parseInt(queryParams.offset, 10);
    if (isNaN(offset)) offset = 0;

    const search = queryParams.search;

    let tournaments: Tournament[] = [];
    if (search == undefined || search == "") {
        tournaments = await GetTournaments(ctx.app.state.pool, limit, offset);
    } else {
        tournaments = await SearchTournaments(ctx.app.state.pool, search, limit, offset);
    }

    let total = -1;
    try {
        total = await GetTournamentsCount(ctx.app.state.pool);
    } catch (e) {
        console.log(e);
    }

    return SendJSONResponse(ctx, { tournaments, total });
});

router.get("/:id/teams", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);

    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const teams = await GetTournamentTeams(ctx.app.state.pool, tournament_id);

    SendJSONResponse(ctx, teams, 200);
});

router.put("/:id/teams", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    if (!user.admin && !organizers.some((u) => u.id === user.id))
        return SendJSONResponse(ctx, { message: "Forbidden, must be organizer or admin" }, 403);

    const tournament = await GetTournament(ctx.app.state.pool, tournament_id);

    if (!tournament) return SendJSONResponse(ctx, { message: "Tournament not found" }, 404);
    if (tournament.status !== TournamentStatus.Created)
        return SendJSONResponse(
            ctx,
            { message: "Tournament already generated, can’t add new teams" },
            400
        );

    const teams = await GetTournamentTeams(ctx.app.state.pool, tournament_id);
    if (tournament.max_teams !== undefined && tournament.max_teams <= teams.length)
        return SendJSONResponse(ctx, { message: "Tournament already has max teams" }, 400);

    const body = await ParseBodyJSON<{
        team_id: number;
        team_number: number;
    }>(ctx);

    const team = await AddTournamentTeam(ctx.app.state.pool, tournament_id, body.team_id);

    SendJSONResponse(ctx, team, 200);
});

router.post("/:id/teams/shuffle", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    if (!user.admin && !organizers.some((u) => u.id === user.id))
        return SendJSONResponse(ctx, { message: "Forbidden, must be organizer or admin" }, 403);

    const teams = await GetTournamentTeams(ctx.app.state.pool, tournament_id);

    if (!teams) return SendJSONResponse(ctx, { message: "No teams" }, 400);

    const shuffled = ShuffleTournamentTeams(teams);

    for (const team of shuffled) {
        await ChangeTeamNumber(ctx.app.state.pool, tournament_id, team.team_id, team.team_number);
    }

    SendJSONResponse(ctx, { message: "OK" }, 200);
});

router.get("/:id/matches", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);

    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const matches = await GetTournamentMatches(ctx.app.state.pool, tournament_id);

    SendJSONResponse(ctx, matches, 200);
});

router.post("/:id/matches/generate", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    if (!user.admin && !organizers.some((u) => u.id === user.id))
        return SendJSONResponse(ctx, { message: "Forbidden, must be organizer or admin" }, 403);

    const tournament = await GetTournament(ctx.app.state.pool, tournament_id);

    if (!tournament) return SendJSONResponse(ctx, { message: "No tournament" }, 400);

    if (tournament.type == TournamentType.None)
        return SendJSONResponse(ctx, { message: "No type" }, 400);

    const matches = await GetTournamentMatches(ctx.app.state.pool, tournament_id);

    if (matches.length > 0) await DeleteTournamentMatches(ctx.app.state.pool, tournament_id);

    const teams = await GetTournamentTeams(ctx.app.state.pool, tournament_id);

    const newMatches = GenerateMatches(tournament, teams);

    for (const match of newMatches.matches) {
        await CreateMatch(
            ctx.app.state.pool,
            match.team1_id,
            match.team2_id,
            match.row,
            match.column,
            tournament_id,
            MatchStatus.Created,
            match.date ?? new Date()
        );
    }

    await UpdateTournament(
        ctx.app.state.pool,
        tournament_id,
        tournament.type,
        TournamentStatus.Generated,
        tournament.name,
        tournament.description,
        tournament.start_date,
        tournament.end_date,
        newMatches.capacity,
        tournament.game_name
    );

    SendJSONResponse(ctx, { message: "generated" }, 200);
});

router.delete("/:id/teams/:team_id", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);
    const team_id = parseInt(ctx.params.team_id, 10);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id) || isNaN(team_id))
        return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    if (!user.admin && !organizers.some((u) => u.id === user.id))
        return SendJSONResponse(ctx, { message: "Forbidden, must be organizer or admin" }, 403);

    await RemoveTournamentTeam(ctx.app.state.pool, tournament_id, team_id);

    SendJSONResponse(ctx, { message: "OK" }, 200);
});

router.patch("/:id/teams/:team_id", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);
    const team_id = parseInt(ctx.params.team_id, 10);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id) || isNaN(team_id))
        return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    if (!user.admin && !organizers.some((u) => u.id === user.id))
        return SendJSONResponse(ctx, { message: "Forbidden, must be organizer or admin" }, 403);

    const tournament = await GetTournament(ctx.app.state.pool, tournament_id);

    if (tournament.status != TournamentStatus.Created)
        return SendJSONResponse(ctx, { message: "Tournament must not be generated" }, 400);

    const body = await ParseBodyJSON<{ team_number: number }>(ctx);

    await ChangeTeamNumber(ctx.app.state.pool, tournament_id, team_id, body.team_number);

    SendJSONResponse(ctx, { message: "OK" }, 200);
});

router.put("/:id/organizers/:user_id", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);
    const user_id = parseInt(ctx.params.user_id, 10);
    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id) || isNaN(user_id))
        return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    if (!user.admin && !organizers.some((u) => u.id === user.id))
        return SendJSONResponse(ctx, { message: "Forbidden, must be organizer or admin" }, 403);

    await AddOrganizer(ctx.app.state.pool, tournament_id, user_id);

    SendJSONResponse(ctx, { message: "OK" }, 200);
});
router.delete("/:id/organizers/:user_id", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);
    const user_id = parseInt(ctx.params.user_id, 10);

    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("Authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    if (isNaN(tournament_id) || isNaN(user_id))
        return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    if (!user.admin && user_id != user.id)
        return SendJSONResponse(
            ctx,
            { message: "Forbidden, must be the user himself or admin" },
            403
        );

    await RemoveOrganizer(ctx.app.state.pool, tournament_id, user_id);

    SendJSONResponse(ctx, { message: "OK" }, 200);
});

router.get("/:id/organizers", async (ctx) => {
    const tournament_id = parseInt(ctx.params.id, 10);
    if (isNaN(tournament_id)) return SendJSONResponse(ctx, { message: "Invalid id" }, 400);

    const organizers = await GetTournamentOrganizers(ctx.app.state.pool, tournament_id);

    SendJSONResponse(ctx, organizers, 200);
});

export { router as Tournaments };
