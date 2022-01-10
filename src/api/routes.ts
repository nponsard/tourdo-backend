import { Application } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { User } from "./routes/user.ts";
const routers = [User];

export default function RegisterRoutes(app: Application<Record<string, unknown>>) {
  for (const router of routers) {
    app.use(router.routes());
  }
}
