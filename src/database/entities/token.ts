import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";

export interface Token {
    accessHash: string;
    userId: number;
}

export async function GetToken(db: Pool, accessHash: string): Promise<Token> {
    const client = await db.connect();

    const result = await client.queryObject<Token>(
        "SELECT access_hash,user_id FROM tokens WHERE access_hash = $1",
        [accessHash]
    );

    client.release();
    return result.rows[0];
}

export async function CreateToken(
    db: Pool,
    accessHash: string,
    userId: number
): Promise<Token> {
    const client = await db.connect();
    const result = await client.queryObject<Token>(
        "INSERT INTO tokens (access_hash,user_id) VALUES ($1, $2) RETURNING *",
        [accessHash, userId]
    );

    client.release();

    return result.rows[0];
}
