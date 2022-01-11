import {
    SignJWT,
    jwtVerify,
    importPKCS8,
    
} from "https://deno.land/x/jose@v4.3.8/index.ts";
const defaultKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgjuYC2M9La5TVCpc8
qUW2GiemiBBuoeD/Cg5x/Es8Jc6hRANCAASqKuzeVIasjUCuNjvc9nFFAVSPGbC1
KTKFz2H5U0mQbpGWFM63b2OEaGfd+FUqh5Mah5iaUd5oQgS19kll3Qe/
-----END PRIVATE KEY-----`;

const secret = Deno.env.get("PRIVATE_KEY") || defaultKey;

if (secret === defaultKey) {
    console.error("PRIVATE_KEY is unsecure and should be changed");
}

const key = await importPKCS8(secret, "ES256");

export function SignToken(id: string, token: string, expirationTime : number) {
    return new SignJWT({ id, token })
        .setProtectedHeader({ alg: "ES256" })
        .setIssuedAt()
        .setIssuer("urn:example:issuer")
        .setAudience("urn:example:audience")
        .setExpirationTime(expirationTime)
        .sign(key);
}

export function DecodeJWT(jwt: string) {
    return jwtVerify(jwt, key);
}

