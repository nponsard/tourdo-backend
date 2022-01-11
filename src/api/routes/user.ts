import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";
import {
    CreateUser,
    GetUserByUsername,
    GetUserAuth,
} from "../../database/entities/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

import { EncryptToken, DecryptJWT } from "../../jwt/mod.ts";
import { crypto as Dcrypto } from "https://deno.land/std@0.120.0/crypto/mod.ts";
import { CreateToken } from "../../database/entities/token.ts";

const router = new Router({ prefix: `${Prefix}/user` });

router.post("/register", async (ctx) => {
    const body = await ParseBodyJSON<{ password: string; username: string }>(
        ctx
    );

    try {
        const used = await GetUserByUsername(ctx.app.state.pool, body.username);
        if (used) {
            SendJSONResponse(ctx, { message: "User already exists" }, 400);
            return;
        }
        const user = await CreateUser(
            ctx.app.state.pool,
            body.username,
            await bcrypt.hash(body.password)
        );
        SendJSONResponse(ctx, user);
    } catch (err) {
        console.log("err :", err);
        SendJSONResponse(ctx, { message: "Database error" }, 400);
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
        SendJSONResponse(ctx, { message: "Wrong username/Password" }, 401);
        return;
    }

    // generate token

    const token = crypto.randomUUID();

    // generate jwt

    const jwt = await EncryptToken(user.id.toString(), token);

    // store jwt hash in database
/*
    CreateToken(
        ctx.app.state.pool,
        new TextDecoder().decode(
            await crypto.subtle.digest("SHA-512", new TextEncoder().encode(jwt))
        ),
        user.id
    );*/

    // return jwt
    SendJSONResponse(ctx, { jwt });
});

router.get("/", (ctx) => {
    ctx.response.body = "Hello World";
});

export { router as User };
