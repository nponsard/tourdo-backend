import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";

export interface Token {
    id: number;
    userId: number;
    token: string;
    expiration: Date;
    refresh_token: string;
    refresh_token_expiration: Date;
}

export async function GetToken(db: Pool, accessHash: string): Promise<Token> {
    const client = await db.connect();

    const result = await client.queryObject<Token>(
        "SELECT access_hash,user_id FROM tokens WHERE access_hash = $1",
        accessHash
    );

    client.release();
    return result.rows[0];
}

export async function CreateToken(
    db: Pool,
    userId: number,
    token: string,
    expiration: Date,
    refreshToken: string,
    refreshTokenExpiration: Date
): Promise<Token> {
    const client = await db.connect();
    const result = await client.queryObject<Token>(
        "INSERT INTO tokens (user_id, token, expiration, refresh_token, refresh_token_expiration) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        userId,
        token,
        expiration,
        refreshToken,
        refreshTokenExpiration
    );

    client.release();

    return result.rows[0];
}
