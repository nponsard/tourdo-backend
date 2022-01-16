import Start from "./api/start.ts";
import { ConnectDefaults } from "./database/connect.ts";
import Init from "./database/init.ts";

const INIT_DB = Deno.env.get("INIT_DB") || "true";

const pool = ConnectDefaults();

// test connection

let connected = false;

while (!connected) {
    try {
        await pool.connect();
        connected = true;
    } catch (e) {
        console.error("error when connecting to the database (retry in 1s) : ", e);
        Deno.sleepSync(1000);
    }
}

if (INIT_DB === "true") {
    await Init(pool);
}

await Start(pool);
