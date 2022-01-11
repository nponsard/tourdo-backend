import { Pool } from "https://deno.land/x/postgres/mod.ts";

export default async function Init(pool: Pool) {
    const client = await pool.connect();

    const scripts = [];

    // fetch base scripts

    for await (const dirEntry of Deno.readDir("database_scripts")) {
        const fileName = dirEntry.name;
        if (fileName.endsWith(".sql")) {
            const sql = await Deno.readTextFile(`database_scripts/${fileName}`);
            scripts.push({ name: fileName, script: sql });
        }
    }

    // sort scripts

    scripts.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    // execute scripts

    for (const script of scripts) {
        console.log(`Running script ${script.name}`);
        await client.queryObject(script.script);
    }

    client.release();
}
