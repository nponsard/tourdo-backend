import { Application } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";
import RegisterRoutes from "./routes.ts";

/**
 * @description Starts the http server, https should be handled by a reverse proxy.
 */
export default async function Start(pool: Pool) {
    const app = new Application({ state: { pool } });

    // middleware to handle CORS
    app.use(async (ctx, next) => {
        ctx.response.headers.set("Access-Control-Allow-Origin", "*");
        ctx.response.headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, DELETE, PUT, PATCH, OPTIONS"
        );

        ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (ctx.request.method === "OPTIONS") {
            ctx.response.status = 200;

            return;
        }

        await next();
    });

    // error handling, so the server doesn't crash and the client recieve an error
    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (e) {
            console.error("Error on ", ctx.request.url, e);

            ctx.response.status = 500;
            ctx.response.body = { message: "Internal server error" };
        }
    });

    RegisterRoutes(app);

    await app.listen({ port: 3000 });
}
