import {
    Pool,
    ClientOptions,
} from "https://deno.land/x/postgres@v0.14.3/mod.ts";

export default function Connect(param: ClientOptions | string) {
    return new Pool(param, 100, true);
}

// connect to database with defaults/env vars
export function ConnectDefaults() {
    let pool;

    const DATABASE_URL = Deno.env.get("DATABASE_URL");

    if (DATABASE_URL) {
        pool = Connect(DATABASE_URL);
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

        pool = Connect({
            database: DB_DATABASE,
            hostname: DB_HOST,
            user: DB_USERNAME,
            password: DB_PASSWORD,
            port: DB_PORT,
        });
    }

    return pool;
}
