import { Pool } from "https://deno.land/x/postgres/mod.ts";

export interface Team {
  id: number;
  name: string;
  description: string;
  match_count: number;
  win_count: number;
}

export async function GetTeam(db: Pool, id: number): Promise<Team> {
  const client = await db.connect();

  const result = await client.queryObject<Team>(
    "SELECT * FROM teams WHERE id = $1",
    [id]
  );

  client.release();
  return result.rows[0] as Team;
}

export async function CreateTeam(
  db: Pool,
  name: string,
  description: string
): Promise<Team> {
  const client = await db.connect();
  const result = await client.queryObject<Team>(
    "INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *",
    [name, description]
  );

  client.release();

  return result.rows[0];
}
