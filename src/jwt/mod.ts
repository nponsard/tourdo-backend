import { create, verify } from "https://deno.land/x/djwt@v2.2/mod.ts";

const defaultKey = `secret`;

const secret = Deno.env.get("ENCRYPTION_KEY") || defaultKey;

if (secret === defaultKey) {
    console.error("ENCRYPTION_KEY is unsecure and should be changed");
}
export function EncryptToken(id: string,token:string) {
    return create(
        {
            alg: "HS512",
            typ: "JWT",
        },
        {
            id,
            token,
        },
        secret
    );
}

export function DecryptJWT(token: string) {
    return verify(token, secret, "HS512");
}
