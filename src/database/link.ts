import { Database } from "https://deno.land/x/denodb@v1.0.40/mod.ts";
import { User } from "./entities/user.ts";
const entities = [User];

export function Link(db: Database) {
  db.link(entities);
}
