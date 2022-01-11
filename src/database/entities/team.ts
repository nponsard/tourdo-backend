import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";
import { User } from "./user.ts";

enum Role {
    PLAYER = 0,
    LEADER = 1,
    COACH = 2,
}

export interface Team {
    id: number;
    name: string;
    description: string;
    match_count: number;
    win_count: number;
}

export async function GetTeam(db: Pool, id: number): Promise<Team> {
    const client = await db.connect();

    const result = await client.queryObject<Team>(
        "SELECT * FROM teams WHERE id = $1",
        [id]
    );

    client.release();
    return result.rows[0] as Team;
}

export async function CreateTeam(
    db: Pool,
    name: string,
    description: string
): Promise<Team> {
    const client = await db.connect();
    const result = await client.queryObject<Team>(
        "INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *",
        [name, description]
    );

    client.release();

    return result.rows[0];
}

export async function GetTeamMembers(
    db: Pool,
    teamId: number
): Promise<User[]> {
    const client = await db.connect();

    const result = await client.queryObject<User>(
        "SELECT * FROM users WHERE id IN (SELECT user_id FROM teams_composition WHERE team_id = $1)",
        [teamId]
    );

    client.release();
    return result.rows;
}


export async function AddTeamMember(
    db: Pool,
    teamId: number,
    userId: number,
    role: Role
): Promise<void> {
    const client = await db.connect();
    await client.queryObject(
        "INSERT INTO teams_composition (team_id, user_id, role) VALUES ($1, $2, $3)",
        [teamId, userId, role]
    );

    client.release();
}