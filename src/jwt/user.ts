import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";
import { GetTokensWithAccessToken } from "../database/entities/token.ts";
import { GetUser } from "../database/entities/user.ts";
import { DecodeJWT } from "./signature.ts";

export async function GetUserWithAccessToken(pool: Pool, accessJWT: string) {
    // decode JWT
    const decoded = await DecodeJWT(accessJWT);
    if (!decoded) return null;

    // check if token is valid in database
    const tokens = await GetTokensWithAccessToken(pool, decoded.payload.token);
    if (!tokens || tokens.userId != decoded.payload.id) return null;

    // get the user
    const user = await GetUser(pool, tokens.userId);
    if (!user) return null;

    return {
        user,
    };
}
