import { Database, PostgresConnector } from "https://deno.land/x/denodb/mod.ts";

export default function Connect(
  database: string,
  host: string,
  username: string,
  password: string,
  port: number
) {
  const connector = new PostgresConnector({
    database,
    host,
    username,
    password,
    port,
  });

  return new Database(connector);
}
