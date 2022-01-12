import { Pool } from "https://deno.land/x/postgres@v0.14.3/mod.ts";

export default async function Init(pool: Pool) {
    console.log("Initializing database...");

    const start = Date.now();

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
        return a.name.localeCompare(b.name, 'en');
    });

    // execute scripts

    for (const script of scripts) {
        console.log(`Running script ${script.name}`);
        await client.queryObject(script.script);
    }

    const diff = new Date(Date.now() - start);
    console.log(
        `Database initialized in ${diff.getMinutes()}m ${diff.getSeconds()}s ${diff.getMilliseconds()}ms`
    );

    client.release();
}
