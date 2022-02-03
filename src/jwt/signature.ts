import { create, verify } from "https://deno.land/x/djwt@v2.4/mod.ts";

// Parse the JWT_KEY at the start (used to sign and verify tokens)

const secret = Deno.env.get("JWT_KEY");

if (!secret || secret.length < 10) {
    console.error("JWT_KEY not set");
    Deno.exit(1);
}
let key: CryptoKey;
try {
    const json = JSON.parse(atob(secret));

    const arr = Uint8Array.from(json);
    key = await crypto.subtle.importKey("raw", arr, { name: "HMAC", hash: "SHA-512" }, true, [
        "sign",
        "verify",
    ]);
} catch (e) {
    console.error("Can’t import JWT_KEY : ", e);
    Deno.exit(1);
}
/**
 * Generate a new JWT signed with the HMAC key
 */
export function SignToken(id: number, token: string, expirationTime: number) {
    return create({ alg: "HS512", typ: "jwt" }, { id, token, exp: expirationTime }, key);
}

/**
 * Decode the JWT and verify it with the HMAC key, an error is thrown if the token is invalid
 */
export function DecodeJWT(jwt: string) {
    return verify(jwt, key) as Promise<{
        id: number;
        token: string;
    }>;
}
