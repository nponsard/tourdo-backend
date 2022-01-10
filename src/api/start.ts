import { Application } from "https://deno.land/x/oak/mod.ts";
import RegisterRoutes from "./routes.ts";

export default async function Start() {
  const app = new Application();

  app.use((ctx) => {
    ctx.response.body = "Hello world!";
  });

  app.use(RegisterRoutes().routes());

  await app.listen({ port: 3000 });
}
