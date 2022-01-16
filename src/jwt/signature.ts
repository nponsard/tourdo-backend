import {
    SignJWT,
    jwtVerify,
    importJWK,
    JWTHeaderParameters,
    KeyLike,
} from "https://deno.land/x/jose@v4.3.8/index.ts";
const defaultKey = `eyJrdHkiOiJvY3QiLCJrIjoiL3NPL0t1VWh4L2VsMkxGVG9Gc3lYUk04TEdSVXhUYlJzYk1FMTRoODB3Z0VreVNZeUVHQ3E4Yyt6VTBETEZQUHlWcytTZVdKTHVEbXovZWRhZ1VqZ2Fhbml1VVVMd3dCSmUyNzZSR0NSV2plNWZncXc0Sno3eU5mSlJqaytYMk1Yc0tNWUhFeTZmb0RyR0laNXVDUnphbTFjTi9ZVGdKQUtHNVRCa1FLU0pBIiwiYWxnIjoiSFM1MTIiLCJrZXlfb3BzIjpbInNpZ24iLCJ2ZXJpZnkiXSwiZXh0Ijp0cnVlfQ==`;

const secret = Deno.env.get("JWK") || defaultKey;

if (secret === defaultKey) {
    console.error("JWK is unsecure and should be changed");
}

// import keys

// let ecPublickey: KeyLike | Uint8Array;
let key: KeyLike | Uint8Array;
try {
    const json = JSON.parse(atob(secret));

    console.log(json);

    key = await crypto.subtle.importKey(
        "jwk",
        json,
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
