import { Application } from "https://deno.land/x/oak/mod.ts";
import { User } from "./routes/user.ts";
const routers = [User];

export default function RegisterRoutes(app: Application<Record<string, any>>) {
  for (const router of routers) {
    app.use(router.routes());
  }
}
