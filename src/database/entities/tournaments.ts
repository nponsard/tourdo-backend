import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";

export enum TournamentType {
    None = 0,
    RoundRobin = 1,
    SimpleElimination = 2,
}

export enum TournamentStatus {
    Created = 0,
    Started = 1,
    Finished = 2,
}

export interface Tournament {
    id: number;
    type: TournamentType;
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    max_teams: number;
    game_name: string;
    status: TournamentStatus;
}

export async function CreateTournament(
    pool: Pool,
    type: TournamentType,
    name: string,
    description: string,
    start_date: Date,
    end_date: Date,
    max_teams: number,
    game_name: string
): Promise<Tournament> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `INSERT INTO tournaments(type, name, description, start_date, end_date, max_teams, game_name) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
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

export async function GetTournaments(pool: Pool, limit = 10): Promise<Tournament[]> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `SELECT * FROM tournaments LIMIT $1`,
        limit
    );

    client.release();
    return result.rows;
}

export async function UpdateTournament(
    pool: Pool,
    id: number,
    type: TournamentType,
    name: string,
    description: string,
    start_date: Date,
    end_date: Date,
    max_teams: number,
    game_name: string
): Promise<Tournament> {
    const client = await pool.connect();
    const result = await client.queryObject<Tournament>(
        `UPDATE tournaments SET type = $1, name = $2, description = $3, start_date = $4, end_date = $5, max_teams = $6, game_name = $7 WHERE id = $8 RETURNING *`,
        type,
        name,
        description,
        start_date,
        end_date,
        max_teams,
        game_name,
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
