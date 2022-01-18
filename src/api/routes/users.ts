import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";
import {
    CreateUser,
    GetUserByUsername,
    GetUserAuth,
} from "../../database/entities/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

import { CreateToken } from "../../database/entities/token.ts";
import { NewTokenPair } from "../../jwt/tokens.ts";
import { GetUserWithAccessToken } from "../../jwt/user.ts";

const router = new Router({ prefix: `${Prefix}/users` });

router.post("/register", async (ctx) => {
    const body = await ParseBodyJSON<{ password: string; username: string }>(
        ctx
    );

    try {
        const used = await GetUserByUsername(ctx.app.state.pool, body.username);
        if (used) {
            return SendJSONResponse(
                ctx,
                { message: "User already exists" },
                400
            );
        }
        const user = await CreateUser(
            ctx.app.state.pool,
            body.username,
            await bcrypt.hash(body.password)
        );
        console.log(user);
        return SendJSONResponse(ctx, user, 201);
    } catch (err) {
        console.log("err :", err);
        return SendJSONResponse(ctx, { message: "Database error" }, 400);
    }
});

router.post("/login", async (ctx) => {
    const body = await ParseBodyJSON<{ password: string; username: string }>(
        ctx
    );

    // check login

    const user = await GetUserAuth(ctx.app.state.pool, body.username);

    console.log(user);

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
        return SendJSONResponse(
            ctx,
            { message: "Wrong username/Password" },
            401
        );
    }

    // generate token

    const tokens = await NewTokenPair(user.id);

    // store jwt hash in database

    await CreateToken(
        ctx.app.state.pool,
        user.id,
        tokens.accessToken,
        new Date(tokens.accessExpiration),
        tokens.refreshToken,
        new Date(tokens.refreshExpiration)
    );

    // return jwt
    return SendJSONResponse(ctx, {
        access_token: tokens.accessJWT,
        refresh_token: tokens.refreshJWT,
    });
});

router.get("/me", async (ctx) => {
    const user = await GetUserWithAccessToken(
        ctx.app.state.pool,
        ctx.request.headers.get("authorization")
    );

    if (!user) return SendJSONResponse(ctx, { message: "Unauthorized" }, 401);

    return SendJSONResponse(ctx, user);
});

router.get("/users/:id", async (ctx) => {
    console.log(ctx.params.id);
});

export { router as Users };
