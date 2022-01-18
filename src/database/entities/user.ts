import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";
import { Team } from "./team.ts";

export interface UserAuth {
    id: number;
    username: string;
    password: string;
    admin: boolean;
}

export interface User {
    id: number;
    username: string;
    admin: boolean;
}

export async function GetUserByUsername(
    pool: Pool,
    username: string
): Promise<User | undefined> {
    console.log(pool);
    const client = await pool.connect();

    const result = await client.queryObject<User>(
        "SELECT id, username, admin FROM users WHERE username = $1",
        username
    );

    client.release();
    return result.rows[0];
}

export async function GetUser(db: Pool, id: number): Promise<User | undefined> {
    const client = await db.connect();

    const result = await client.queryObject<User>(
        "SELECT id,username, admin FROM users WHERE id = $1",
        id
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
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id,username, admin",
        username,
        password
    );

    client.release();

    return result.rows[0];
}

export async function GetUserAuthByUsername(
    db: Pool,
    username: string
): Promise<UserAuth> {
    const client = await db.connect();
    const result = await client.queryObject<UserAuth>(
        "SELECT id,username,password,admin FROM users WHERE username = $1 ",
        username
    );

    client.release();
    return result.rows[0];
}
export async function GetUserAuthByID(
    db: Pool,
    userID: number
): Promise<UserAuth> {
    const client = await db.connect();
    const result = await client.queryObject<UserAuth>(
        "SELECT id,username,password,admin FROM users WHERE id = $1 ",
        userID
    );

    client.release();
    return result.rows[0];
}

export async function GetParticipationInTeams(db: Pool, userID: number) {
    const client = await db.connect();

    const result = await client.queryObject<Team>(
        "SELECT * FROM teams WHERE id IN (SELECT team_id FROM teams_composition WHERE user_id = $1)",
        userID
    );

    client.release();
    return result.rows;
}

export async function UpdateUser(
    db: Pool,
    userID: number,
    password: string,
    admin: boolean
): Promise<boolean> {
    const client = await db.connect();
    const result = await client.queryObject(
        "UPDATE users SET password = $1, admin = $2 WHERE id = $3",
        password,
        admin,
        userID
    );

    client.release();
    return result.rowCount != undefined && result.rowCount >= 1;
}
