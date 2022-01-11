import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";

import { SendJSONResponse } from "../utils.ts";

import { Prefix } from "../utils.ts";

import { CreateUser, GetUserByUsername } from "../../database/entities/user.ts";
import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";
import { ApplicationState } from "../utils.ts";

const router = new Router({ prefix: `${Prefix}/user` });

router.post("/register", async (ctx) => {
    let body;
    console.log(ctx.app.state.pool);

    try {
        body = await ctx.request.body({ type: "json" }).value;
        if (!body || !body.username || !body.password) {
            throw new Error("Invalid JSON/body");
        }
    } catch (err) {
        console.log("err :", err);
        SendJSONResponse(ctx, { message: "Invalid JSON/body" }, 400);
        return;
    }

    try {
        const used = await GetUserByUsername(ctx.app.state.pool, body.username);
        if (used) {
            SendJSONResponse(ctx, { message: "User already exists" }, 400);
            return;
        }
        const user = await CreateUser(
            ctx.app.state.pool,
            body.username,
            body.password
        );
        SendJSONResponse(ctx, user);
    } catch (err) {
        console.log("err :", err);
        SendJSONResponse(ctx, { message: "Database error" }, 400);
    }
});

router.post("/login", (ctx) => {
    console.log(ctx.request.body().value);
    console.log(ctx);

    // check login

    // generate token

    // generate jwt

    // store jwt hash in database

    // return jwt
});

router.get("/", (ctx) => {
    ctx.response.body = "Hello World";
});

export { router as User };
