import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";

export default async function Connect(
    database: string,
    hostname: string,
    user: string,
    password: string,
    port: number
) {
    const client = new Pool(
        {
            database,
            hostname,
            user,
            password,
            port,
        },
        40,
        true
    );
    await client.connect();

    return client;
}

// connect to database with defaults/env vars
export async function ConnectDefaults() {
    const DB_HOST = Deno.env.get("DB_HOST") || "localhost";
    const DB_DATABASE = Deno.env.get("DB_DATABASE") || "tournament";
    const DB_USERNAME = Deno.env.get("DB_USERNAME") || "postgres";
    const DB_PASSWORD = Deno.env.get("DB_PASSWORD") || "postgres";

    let DB_PORT = 5432;

    const port = Deno.env.get("DB_PORT");
    if (port && !isNaN(parseInt(port))) {
        DB_PORT = parseInt(port);
    }

    const client = await Connect(
        DB_DATABASE,
        DB_HOST,
        DB_USERNAME,
        DB_PASSWORD,
        DB_PORT
    );

    return client;
}
