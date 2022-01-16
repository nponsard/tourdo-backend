import { SignToken } from "./signature.ts";

export async function NewTokenPair(userId: number) {
    const accessToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();

    // One day
    const accessExpiration = Date.now() + 1000 * 60 * 60 * 24;

    // Three weeks
    const refreshExpiration = Date.now() + 1000 * 60 * 60 * 24 * 7 * 3;

    // generate jwt

    const accessJWT = await SignToken(userId, accessToken, accessExpiration);
    const refreshJWT = await SignToken(userId, refreshToken, refreshExpiration);
    return {
        accessJWT,
        refreshJWT,
        accessToken,
        refreshToken,
        accessExpiration,
        refreshExpiration,
    };
}
