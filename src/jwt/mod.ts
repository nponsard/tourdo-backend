import {
    EncryptJWT,
    jwtDecrypt,
} from "https://deno.land/x/jose@v4.3.8/index.ts";

const secret = Deno.env.get("ENCRYPTION_KEY") || "secret";

if (secret == "secret") {
    console.error("ENCRYPTION_KEY is unsecure and should be changed");
}

const encryptionKey = new TextEncoder().encode(secret);

export function EncryptToken(id: string) {
    return new EncryptJWT({ userId: id })
        .setProtectedHeader({ alg: "dir", typ: "JWT", enc: "A256GCM" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .encrypt(encryptionKey);
}
