const type = {
    name: "ECDSA",
    namedCurve: "P-384",
};

const methods: KeyUsage[] = ["sign", "verify"];

const key = await crypto.subtle.generateKey(type, true, methods);
console.log(key);

let e;

const exported = await crypto.subtle.exportKey("jwk", key.privateKey as unknown as CryptoKey);

const imported = await crypto.subtle.importKey(
    "jwk",
    exported,
    type,
    true,
    methods
);
console.log(imported);
const json = JSON.stringify(exported);
console.log(btoa(json));
