import Start from "./api/start.ts";
import { ConnectDefaults } from "./database/connect.ts";
import Init from "./database/init.ts";

const INIT_DB = Deno.env.get("INIT_DB") || "true";

const pool = ConnectDefaults();

// test connection

const client = await pool.connect();
client.release();

if (INIT_DB === "true") {
    await Init(pool);
}

await Start(pool);
