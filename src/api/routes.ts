import { Application } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { ApplicationState } from "./utils.ts";

import { User } from "./routes/user.ts";

const routers = [User];

export default function RegisterRoutes(app: ApplicationState) {
    for (const router of routers) {
        app.use(router.routes());
    }
}
