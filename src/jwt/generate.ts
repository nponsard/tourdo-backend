// This files generates a new random HMAC key to sign and verify JWT tokens.

const type = { name: "HMAC", hash: "SHA-512" };
const methods: KeyUsage[] = ["sign", "verify"];
const key = await crypto.subtle.generateKey(type, true, methods);
const exported = await crypto.subtle.exportKey("raw", key as CryptoKey);
const decoded = new Uint8Array(exported);
const arr = Array.from(decoded);

console.log(btoa(JSON.stringify(arr)));
