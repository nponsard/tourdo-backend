import Start from "./api/start.ts";
import { ConnectDefaults } from "./database/connect.ts";
import Init from "./database/init.ts";

const INIT_DB = Deno.env.get("INIT_DB") || "true";

const pool = ConnectDefaults();

// test connection to the database before starting

async function testConnection() {
    try {
        const client = await pool.connect();
        client.release();
    } catch (e) {
        console.error("error when connecting to the database (retry in 1s) : ", e);
        await new Promise((resolve) => setTimeout(resolve, 1000)).then(testConnection);
    }
}
await testConnection();

// set INIT_DB to something different than "true" to skip database initialization

if (INIT_DB === "true") {
    await Init(pool);
}

await Start(pool);
