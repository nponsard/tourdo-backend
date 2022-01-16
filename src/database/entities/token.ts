import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";

export interface Token {
    id: number;
    user_id: number;
    accessToken: string;
    expiration: Date;
    refresh_token: string;
    refresh_token_expiration: Date;
}

export async function GetTokensWithAccessToken(
    db: Pool,
    accessToken: string
): Promise<Token> {
    const client = await db.connect();

    const result = await client.queryObject<Token>(
        "SELECT id,user_id,access_token,expiration,refresh_token,refresh_token_expiration FROM tokens WHERE access_token = $1",
        accessToken
    );

    client.release();
    return result.rows[0];
}

export async function GetTokensWithRefreshToken(
    db: Pool,
    refreshToken: string
): Promise<Token> {
    const client = await db.connect();

    const result = await client.queryObject<Token>(
        "SELECT id,user_id,access_token,expiration,refresh_token,refresh_token_expiration FROM tokens WHERE refresh_token = $1",
        refreshToken
    );

    client.release();
    return result.rows[0];
}

export async function CreateToken(
    db: Pool,
    userId: number,
    accessToken: string,
    expiration: Date,
    refreshToken: string,
    refreshTokenExpiration: Date
): Promise<Token> {
    const client = await db.connect();
    const result = await client.queryObject<Token>(
        "INSERT INTO tokens (user_id, access_token, expiration, refresh_token, refresh_token_expiration) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        userId,
        accessToken,
        expiration,
        refreshToken,
        refreshTokenExpiration
    );

    client.release();

    return result.rows[0];
}
