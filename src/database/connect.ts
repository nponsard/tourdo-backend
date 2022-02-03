import { Pool, ClientOptions } from "https://deno.land/x/postgres@v0.14.3/mod.ts";

export default function Connect(param: ClientOptions | string, poolSize: number): Pool {
    return new Pool(param, poolSize, true);
}

/*
 * Connect to the database using env variables
 */
export function ConnectDefaults() {
    let pool;

    const DATABASE_URL = Deno.env.get("DATABASE_URL");
    const poolSize = parseInt(Deno.env.get("DB_POOL_SIZE") ?? "a", 10) || 100;

    // use DATABASE_URL first, otherwise check for detailed env variables.

    if (DATABASE_URL) {
        pool = Connect(DATABASE_URL, poolSize);
    } else {
        const DB_HOST = Deno.env.get("DB_HOST") || "localhost";
        const DB_DATABASE = Deno.env.get("DB_DATABASE") || "tournament";
        const DB_USERNAME = Deno.env.get("DB_USERNAME") || "postgres";
        const DB_PASSWORD = Deno.env.get("DB_PASSWORD") || "postgres";

        let DB_PORT = 5432;

        const port = Deno.env.get("DB_PORT");
        if (port && !isNaN(parseInt(port))) {
            DB_PORT = parseInt(port);
        }

        pool = Connect(
            {
                database: DB_DATABASE,
                hostname: DB_HOST,
                user: DB_USERNAME,
                password: DB_PASSWORD,
                port: DB_PORT,
            },
            poolSize
        );
    }

    return pool;
}
