import Start from "./api/start.ts";
import { ConnectDefaults } from "./database/connect.ts";
import Init from "./database/init.ts";

const INIT_DB = Deno.env.get("INIT_DB") || "false";

const pool = await ConnectDefaults();

if (INIT_DB === "true") {
  await Init(pool);
}

await Start();
