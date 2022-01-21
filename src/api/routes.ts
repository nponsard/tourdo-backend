import { ApplicationState } from "./utils.ts";

import { Users } from "./routes/users.ts";
import { Tokens } from "./routes/tokens.ts";
import { Teams } from "./routes/teams.ts";
import { Matches } from "./routes/matches.ts";
import { Tournaments } from "./routes/tournaments.ts";

const routers = [Users, Tokens, Teams, Tournaments, Matches];

export default function RegisterRoutes(app: ApplicationState) {
    for (const router of routers) {
        app.use(router.routes());
    }
}
