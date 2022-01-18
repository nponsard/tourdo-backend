import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";
import { GetTokensWithAccessToken } from "../database/entities/token.ts";
import { GetUser } from "../database/entities/user.ts";
import { DecodeJWT } from "./signature.ts";


export async function GetUserWithAccessToken(
    pool: Pool,
    accessJWT: string | null
) {
    if (!accessJWT) return null;

    // decode JWT
    const decoded = await DecodeJWT(accessJWT);
    if (!decoded) return null;

    // check if token is valid in database
    const tokens = await GetTokensWithAccessToken(pool, decoded.token);
    if (
        !tokens ||
        tokens.user_id != decoded.id ||
        tokens.expiration.getTime() < Date.now() /* invalid if expired  */
    )
        return null;

    // get the user
    const user = await GetUser(pool, tokens.user_id);
    if (!user) return null;

    return user;
}
