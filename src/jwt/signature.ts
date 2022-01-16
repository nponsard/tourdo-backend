import {
    SignJWT,
    jwtVerify,
    importJWK,
    JWTHeaderParameters,
    KeyLike,
} from "https://deno.land/x/jose@v4.3.8/index.ts";
const defaultKey = `Wzc4LDE5NCwxNzUsMjQ0LDEzNywxMCwyMDcsMTk4LDcyLDYwLDUxLDIzNSwxNDgsMjAzLDI1MCwxMjEsNiwyMzYsODksMTQ1LDEwMiwyMjYsMTIsMjM3LDM3LDY5LDEwNCwxODEsMzQsMTI2LDI1MywyMDYsNDEsMTE1LDEzOCwxMTUsMTcyLDIzNSwxMjAsMjE4LDI1MiwyMjgsODIsNzMsNzMsMTc3LDE0LDEwNiw4NSw3OCwxMzIsMTA3LDEwOCw4NSwyNTMsMTgxLDE0MywyMjUsMzgsMCwxMDcsMjIxLDYsNTcsMjExLDIyMSwxMTYsMTU3LDQyLDM2LDc3LDExOSwxOTYsODIsNSwxNjAsMTY0LDE2OCwyMTEsNTMsNSwyMzgsMCwxMzAsMTEyLDEzMCwzMSwxNDYsMTg3LDIwNiwxMzEsMjQ5LDE3OCwxMTksMTI2LDc1LDIxMSwxNDcsMTYwLDc2LDE1MiwxNDUsMTE0LDM4LDExNSwyNiwxMzQsNzIsMjUsMjQ4LDEyNSwyMDEsMjAsNTEsMjYsMTEyLDk5LDExNCwxMTksMzYsMjM2LDc0LDgzLDc0LDI5LDcyLDIyMyw2Nl0=`;

const secret = Deno.env.get("JWT_KEY") || defaultKey;

if (secret === defaultKey) {
    console.error("JWT_KEY is unsecure and should be changed");
}

// import keys

// let ecPublickey: KeyLike | Uint8Array;
let key: KeyLike | Uint8Array;
try {
    const json = JSON.parse(atob(secret));

    const arr = Uint8Array.from(json)
    key = await crypto.subtle.importKey(
        "raw",
        arr,
        { name: "HMAC", hash: "SHA-512" },
        true,
        ["sign", "verify"]
    );
    // ecPrivatekey = await importJWK(json.exportedPrivate);
} catch (e) {
    console.error("Can’t import JWK", e);
    Deno.exit(1);
}

console.log(key);

export function SignToken(id: number, token: string, expirationTime: number) {
    return new SignJWT({ id, token })
        .setProtectedHeader({ alg: "ES256" })
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(key);
}

export function DecodeJWT(jwt: string) {
    return jwtVerify(jwt, key) as Promise<{
        payload: { id: number; token: string };
        protectedHeader: JWTHeaderParameters;
    }>;
}
