import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";
import { Team } from "./team.ts";

export interface UserAuth {
    id: number;
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
}

export async function GetUserByUsername(
    db: Pool,
    username: string
): Promise<User | undefined> {
    const client = await db.connect();

    const result = await client.queryObject<User>(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    client.release();
    return result.rows[0];
}

export async function GetUser(db: Pool, id: number): Promise<User | undefined> {
    const client = await db.connect();

    const result = await client.queryObject<User>(
        "SELECT id,username FROM users WHERE id = $1",
        [id]
    );

    client.release();
    return result.rows[0];
}

export async function CreateUser(
    db: Pool,
    username: string,
    password: string
): Promise<User> {
    const client = await db.connect();
    const result = await client.queryObject<User>(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id,username",
        [username, password]
    );

    client.release();

    return result.rows[0];
}

export async function CheckCredentials(
    db: Pool,
    username: string,
    password: string
): Promise<boolean> {
    const client = await db.connect();
    const result = await client.queryObject<UserAuth>(
        "SELECT id,username,password FROM users WHERE username = $1 AND password = $2",
        [username, password]
    );

    client.release();

    if (result.rows.length === 0) {
        return false;
    }

    const userAuth = result.rows[0];

    return userAuth.password === password;
}

export async function GetParticipationInTeams(db: Pool, userID: number) {
    const client = await db.connect();

    const result = await client.queryObject<Team>(
        "SELECT * FROM teams WHERE id IN (SELECT team_id FROM teams_composition WHERE user_id = $1)",
        [userID]
    );

    client.release();
    return result.rows;
}
