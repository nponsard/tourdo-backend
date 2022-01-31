import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";
import { Match } from "./matches.ts";
import { Team } from "./teams.ts";
import { User } from "./user.ts";

export enum TournamentType {
    None = 0,
    RoundRobin = 1,
    SimpleElimination = 2,
}

export enum TournamentStatus {
    Created = 0,
    Generated = 1,
    Started = 2,
    Finished = 3,
}

export interface Tournament {
    id: number;
    type: TournamentType;
    name: string;
    description: string;
    start_date: Date | null;
    end_date: Date | null;
    max_teams: number;
    game_name: string;
    status: TournamentStatus;
}
export interface TournamentTeam {
    team: Team;
    team_number: number;
}

export async function CreateTournament(
    pool: Pool,
    type: TournamentType,
    name: string,
    description: string,
    start_date: Date | null,
    end_date: Date | null,
    max_teams: number,
    game_name: string
): Promise<Tournament> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `INSERT INTO tournaments(type, name, description, start_date, end_date, max_teams, game_name) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id, type, name, description, start_date, end_date, max_teams, game_name, status`,
        type,
        name,
        description,
        start_date,
        end_date,
        max_teams,
        game_name
    );

    client.release();
    return result.rows[0];
}

export async function GetTournament(pool: Pool, id: number): Promise<Tournament> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `SELECT * FROM tournaments WHERE id = $1`,
        id
    );

    client.release();
    return result.rows[0];
}

export async function GetTournaments(pool: Pool, limit = 10, offset = 0): Promise<Tournament[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `SELECT * FROM tournaments LIMIT $1 OFFSET $2`,
        limit,
        offset
    );

    client.release();
    return result.rows;
}

export async function SearchTournaments(
    pool: Pool,
    query: string,
    limit = 10,
    offset = 0
): Promise<Tournament[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `SELECT * FROM tournaments WHERE LOWER(name) LIKE '%' || LOWER($1) || '%' or LOWER(game_name) LIKE '%' || LOWER($1) || '%' ORDER BY id DESC  LIMIT $2 OFFSET $3`,
        query,
        limit,
        offset
    );

    client.release();
    return result.rows;
}
export async function GetTournamentsCount(pool: Pool): Promise<number> {
    const client = await pool.connect();
    const result = await client.queryObject<{ count: BigInt }>(`SELECT count(*) FROM tournaments`);

    client.release();
    return Number(result.rows[0].count); // we may hit a limit of 1.7976931348623157e+308, but it’s far enough
}

export async function GetTournamentExactName(pool: Pool, name: string): Promise<Tournament> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `SELECT * FROM tournaments WHERE name = $1`,
        name
    );

    client.release();
    return result.rows[0];
}

export async function UpdateTournament(
    pool: Pool,
    id: number,
    type: TournamentType,
    status: TournamentStatus,
    name: string,
    description: string,
    start_date: Date | null,
    end_date: Date | null,
    max_teams: number,
    game_name: string
): Promise<Tournament> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `UPDATE tournaments SET type = $1, name = $2, description = $3, start_date = $4, end_date = $5, max_teams = $6, game_name = $7 , status = $8, WHERE id = $9 RETURNING *`,
        type,
        name,
        description,
        start_date,
        end_date,
        max_teams,
        game_name,
        status,
        id
    );

    client.release();
    return result.rows[0];
}

export async function DeleteTournament(pool: Pool, id: number): Promise<Tournament> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `DELETE FROM tournaments WHERE id = $1 RETURNING *`,
        id
    );

    client.release();
    return result.rows[0];
}

export async function GetTournamentTeams(
    pool: Pool,
    tournament_id: number
): Promise<{ team: Team; team_number: number }[]> {
    const client = await pool.connect();
    const result = await client.queryObject<{
        id: number;
        name: string;
        description: string;
        match_count: number;
        win_count: number;
        team_number: number;
    }>(
        `SELECT teams.*, tournaments_participants.team_number team_number FROM teams JOIN tournaments_participants ON teams.id = tournaments_participants.team_id WHERE tournaments_participants.tournament_id = $1`,
        tournament_id
    );

    client.release();

    const out = [];

    for (const entry of result.rows) {
        console.log(entry);
        out.push({
            team: {
                id: entry.id,
                name: entry.name,
                description: entry.description,
                match_count: entry.match_count,
                win_count: entry.win_count,
            },
            team_number: entry.team_number,
        });
    }
    console.log(out);

    return out;
}

export async function GetTournamentMatches(pool: Pool, id: number): Promise<Match[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `SELECT matches.* FROM matches WHERE matches.tournament_id = $1`,
        id
    );

    client.release();
    return result.rows;
}

export async function GetTournamentMatchesWithTeamId(
    pool: Pool,
    tournament_id: number,
    team_id: number
): Promise<Match[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `SELECT matches.* FROM matches matches.tournament_id = $1 AND (matches.team1_id = $2 OR matches.team2_id = $2)`,
        tournament_id,
        team_id
    );

    client.release();
    return result.rows;
}

export async function AddTournamentTeam(
    pool: Pool,
    tournament_id: number,
    team_id: number,
): Promise<void> {
    const client = await pool.connect();
    await client.queryObject(
        `INSERT INTO tournaments_participants(tournament_id, team_id) VALUES($1,$2)`,
        tournament_id,
        team_id,
    );

    client.release();
}

export async function RemoveTournamentTeam(
    pool: Pool,
    tournament_id: number,
    team_id: number
): Promise<void> {
    const client = await pool.connect();
    await client.queryObject(
        `DELETE FROM tournaments_participants WHERE tournament_id = $1 AND team_id = $2`,
        tournament_id,
        team_id
    );

    client.release();
}

export async function ChangeTeamNumber(
    pool: Pool,
    tournament_id: number,
    team_id: number,
    team_number: number
): Promise<void> {
    const client = await pool.connect();
    await client.queryObject(
        `UPDATE tournaments_participants SET team_number = $1 WHERE tournament_id = $2 AND team_id = $3`,
        team_number,
        tournament_id,
        team_id
    );

    client.release();
}

export async function AddOrganizer(
    pool: Pool,
    tournament_id: number,
    user_id: number
): Promise<{ tournament_id: number; user_id: number }> {
    const client = await pool.connect();
    const response = await client.queryObject<{ tournament_id: number; user_id: number }>(
        `INSERT INTO tournaments_organizers(tournament_id, user_id) VALUES($1,$2) RETURNING tournament_id, user_id`,
        tournament_id,
        user_id
    );

    client.release();
    return response.rows[0];
}

export async function RemoveOrganizer(
    pool: Pool,
    tournament_id: number,
    user_id: number
): Promise<{ tournament_id: number; user_id: number }> {
    const client = await pool.connect();
    const response = await client.queryObject<{ tournament_id: number; user_id: number }>(
        `DELETE FROM tournaments_organizers WHERE tournament_id = $1 AND user_id = $2 RETURNING tournament_id, user_id`,
        tournament_id,
        user_id
    );

    client.release();
    return response.rows[0];
}

export async function GetTournamentOrganizers(pool: Pool, tournament_id: number): Promise<User[]> {
    const client = await pool.connect();
    const result = await client.queryObject<User>(
        `SELECT users.* FROM users JOIN tournaments_organizers ON users.id = tournaments_organizers.user_id WHERE tournaments_organizers.tournament_id = $1`,
        tournament_id
    );

    client.release();
    return result.rows;
}

export async function GetTournamentsOrganizedByUser(
    pool: Pool,
    user_id: number
): Promise<Tournament[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `SELECT tournaments.* FROM tournaments JOIN tournaments_organizers ON tournaments.id = tournaments_organizers.tournament_id WHERE tournaments_organizers.user_id = $1`,
        user_id
    );

    client.release();
    return result.rows;
}

export async function DeleteTournamentMatches(pool: Pool, tournament_id: number): Promise<void> {
    const client = await pool.connect();
    await client.queryObject(`DELETE FROM matches WHERE tournament_id = $1`, tournament_id);

    client.release();
}
