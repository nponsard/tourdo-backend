import { Database, PostgresConnector } from "https://deno.land/x/denodb@v1.0.40/mod.ts";

import { Link } from "./link.ts";

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

  const db = new Database(connector);

  Link(db);

  db.sync();

  return db;
}


// connect to database with defaults/env vars
export function ConnectDefaults() {
  const DB_HOST = Deno.env.get("DB_HOST") || "localhost";
  const DB_NAME = Deno.env.get("DB_NAME") || "tournament";
  const DB_USERNAME = Deno.env.get("DB_USERNAME") || "postgres";
  const DB_PASSWORD = Deno.env.get("DB_PASSWORD") || "postgres";
  
  
  let DB_PORT = 5432;

  const port = Deno.env.get("DB_PORT");
  if (port && !isNaN(parseInt(port))) {
    DB_PORT = parseInt(port);
  }
  

  const db = Connect(DB_NAME, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT);
  
  // TODO : Add triggers 
  
  // db.query("");
  return db
}
