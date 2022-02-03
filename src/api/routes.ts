import { ApplicationState } from "./utils.ts";

import { Users } from "./routes/users.ts";
import { Tokens } from "./routes/tokens.ts";
import { Teams } from "./routes/teams.ts";
import { Matches } from "./routes/matches.ts";
import { Tournaments } from "./routes/tournaments.ts";

// List of routers to use
const routers = [Users, Tokens, Teams, Tournaments, Matches];

/**
 *
 * @description This function registers all needed routes to the application.
 *
 */
export default function RegisterRoutes(app: ApplicationState) {
    for (const router of routers) app.use(router.routes());
}
