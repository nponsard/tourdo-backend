import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";


/**
 * This file contains all the database functions concerning the matches
 */
export interface Match {
    id: number;
    team1_id: number;
    team2_id: number;
    row: number;
    column: number;
    tournament_id: number;
    status: MatchStatus;
    date: Date;
}
export enum MatchStatus {
    Created = 0,
    Team1Won = 1,
    Team2Won = 2,
    Draw = 3,
    Canceled = 4,
    Started = 5,
}

export async function CreateMatch(
    pool: Pool,
    team1_id: number | null,
    team2_id: number | null,
    row: number,
    column: number,
    tournament_id: number,
    status: MatchStatus,
    date: Date
): Promise<Match> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `INSERT INTO matches(team1_id, team2_id, row, "column", tournament_id, status, date) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        team1_id,
        team2_id,
        row,
        column,
        tournament_id,
        status,
        date
    );

    client.release();
    return result.rows[0];
}
export async function GetMatch(pool: Pool, id: number): Promise<Match> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(`SELECT * FROM matches WHERE id = $1`, id);

    client.release();
    return result.rows[0];
}

export async function GetTournamentMatch(
    pool: Pool,
    tournament_id: number,
    row: number,
    column: number
): Promise<Match> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `SELECT * FROM matches WHERE tournament_id = $1 and row = $2 and "column" = $3`,
        tournament_id,
        row,
        column
    );

    client.release();
    return result.rows[0];
}

export async function GetMatches(pool: Pool, limit = 10): Promise<Match[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(`SELECT * FROM matches LIMIT $1`, limit);

    client.release();
    return result.rows;
}
export async function GetMatchesWithTournamentId(pool: Pool, id: number): Promise<Match[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `SELECT * FROM matches WHERE tournament_id = $1`,
        id
    );

    client.release();
    return result.rows;
}
export async function GetMatchesWithTeamId(pool: Pool, id: number): Promise<Match[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `SELECT * FROM matches WHERE team1_id = $1 OR team2_id = $1`,
        id
    );

    client.release();
    return result.rows;
}
export async function GetMatchesWithTeamIds(
    pool: Pool,
    team1_id: number,
    team2_id: number
): Promise<Match[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `SELECT * FROM matches WHERE team1_id = $1 AND team2_id = $2`,
        team1_id,
        team2_id
    );

    client.release();
    return result.rows;
}
export async function UpdateMatch(
    pool: Pool,
    id: number,
    team1_id: number,
    team2_id: number,
    row: number,
    column: number,
    tournament_id: number,
    status: MatchStatus,
    date: Date
): Promise<Match> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `UPDATE matches SET team1_id = $1, team2_id = $2, row = $3, "column" = $4, tournament_id = $5, status = $6, date = $7 WHERE id = $8 RETURNING id`,
        team1_id,
        team2_id,
        row,
        column,
        tournament_id,
        status,
        date,
        id
    );

    client.release();
    return result.rows[0];
}

export async function DeleteMatch(pool: Pool, id: number): Promise<Match> {
    const client = await pool.connect();
    const result = await client.queryObject<Match>(
        `DELETE FROM matches WHERE id = $1 RETURNING id`,
        id
    );

    client.release();
    return result.rows[0];
}
