import { generateKeyPair } from "https://deno.land/x/jose@v4.3.8/index.ts";

const cryptoKey = await generateKeyPair("PS256");

const exportedPrivate = await crypto.subtle.exportKey(
    "jwk",
    cryptoKey.privateKey as CryptoKey
);

const exportedPublic = await crypto.subtle.exportKey(
    "jwk",
    cryptoKey.publicKey as CryptoKey
);

const json = JSON.stringify({ exportedPrivate, exportedPublic });

console.log(btoa(json));
