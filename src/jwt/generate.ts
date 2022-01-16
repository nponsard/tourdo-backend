const type = { name: "HMAC", hash: "SHA-512" };

const methods: KeyUsage[] = ["sign", "verify"];

const key = await crypto.subtle.generateKey(type, true, methods);
console.log(key);

const exported = await crypto.subtle.exportKey("raw", key as CryptoKey);

const decoded = new Uint8Array(exported);

const arr = Array.from(decoded);

console.log(btoa(JSON.stringify(arr)));

// console.log(btoa(decoded));
