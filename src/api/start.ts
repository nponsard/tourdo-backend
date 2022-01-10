import { Application } from "https://deno.land/x/oak/mod.ts";
import RegisterRoutes from "./routes.ts";

export default async function Start() {
  const app = new Application();

  app.use(async (ctx, next) => {
    console.log(ctx)
    await next();
  })

  RegisterRoutes(app);

  await app.listen({ port: 3000 });
}
