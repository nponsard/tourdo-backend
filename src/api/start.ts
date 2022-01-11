import { Application } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";
import RegisterRoutes from "./routes.ts";

export default async function Start(pool: Pool) {
    const app = new Application({ state: { pool } });

    // app.use(async (ctx, next) => {
    //   console.log(ctx)
    //   await next();
    // })

    RegisterRoutes(app);

    await app.listen({ port: 3000 });
}
