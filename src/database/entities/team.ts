import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";
import { User } from "./user.ts";

export enum Role {
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
        id
    );

    client.release();
    return result.rows[0] as Team;
}

export async function CreateTeam(
    db: Pool,
    name: string,
    description: string,
    userID: number
) {
    const client = await db.connect();
    const transaction = client.createTransaction("team_transaction");

    await transaction.begin();
    const team = await transaction.queryObject<Team>(
        "INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *",
        name,
        description
    );

    await transaction.queryObject(
        "INSERT INTO teams_composition (team_id, user_id, role) VALUES ($1, $2, $3)",
        team.rows[0].id,
        userID,
        Role.LEADER
    );

    await transaction.commit();
    client.release();
    return team.rows[0];
}

export async function UpdateTeam(
    db: Pool,
    id: number,
    name: string,
    description: string
): Promise<Team> {
    const client = await db.connect();
    const result = await client.queryObject<Team>(
        "UPDATE teams SET name = $1, description = $2 WHERE id = $3 RETURNING *",
        name,
        description,
        id
    );

    client.release();

    return result.rows[0];
}

export async function DeleteTeam(db: Pool, id: number): Promise<Team> {
    const client = await db.connect();
    const result = await client.queryObject<Team>(
        "DELETE FROM teams WHERE id = $1 RETURNING *",
        id
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
        teamId
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
        teamId,
        userId,
        role
    );

    client.release();
}

export async function RemoveTeamMember(
    db: Pool,
    teamId: number,
    userId: number
): Promise<void> {
    const client = await db.connect();
    await client.queryObject(
        "DELETE FROM teams_composition WHERE team_id = $1 AND user_id = $2",
        teamId,
        userId
    );

    client.release();
}

export async function UpdateTeamMemberRole(
    db: Pool,
    teamId: number,
    userId: number,
    role: Role
): Promise<void> {
    const client = await db.connect();
    await client.queryObject(
        "UPDATE teams_composition SET role = $1 WHERE team_id = $2 AND user_id = $3",
        role,
        teamId,
        userId
    );

    client.release();
}
