import { ApplicationState } from "./utils.ts";

import { Users } from "./routes/users.ts";
import { Tokens } from "./routes/tokens.ts";
import { Teams } from "./routes/teams.ts";

const routers = [Users, Tokens, Teams];

export default function RegisterRoutes(app: ApplicationState) {
    for (const router of routers) {
        app.use(router.routes());
    }
}
