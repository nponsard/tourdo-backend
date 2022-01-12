import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";
import {
    CreateUser,
    GetUserByUsername,
    GetUserAuth,
} from "../../database/entities/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

import { DecodeJWT, SignToken } from "../../jwt/mod.ts";
import { crypto as Dcrypto } from "https://deno.land/std@0.120.0/crypto/mod.ts";
import {
    CreateToken,
    GetTokensWithAccessToken,
    GetTokensWithRefreshToken,
} from "../../database/entities/token.ts";

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

    const accessToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();

    const oneDay = Date.now() + 1000 * 60 * 60 * 24;
    const threeWeeks = Date.now() + 1000 * 60 * 60 * 24 * 7 * 3;

    // generate jwt

    const accessJWT = await SignToken(user.id, accessToken, oneDay);
    const refreshJWT = await SignToken(user.id, refreshToken, threeWeeks);

    // store jwt hash in database

    CreateToken(
        ctx.app.state.pool,
        user.id,
        accessToken,
        new Date(oneDay),
        refreshToken,
        new Date(threeWeeks)
    );

    // return jwt
    SendJSONResponse(ctx, { accessJWT, refreshJWT });
});

router.post("/refresh", async (ctx) => {
    const request = await ParseBodyJSON<{ refreshToken: string }>(ctx);

    try {
        const decoded = await DecodeJWT(request.refreshToken);

        if (!(typeof decoded.payload.token === "string"))
            throw new Error("Invalid token");

        if (!(typeof decoded.payload.id === "number"))
            throw new Error("Invalid token");

        const tokens = await GetTokensWithRefreshToken(
            ctx.app.state.pool,
            decoded.payload.token
        );

        if (!tokens || decoded.payload.id != tokens.userId)
            throw new Error("Invalid token");

        // generate new tokens
    } catch (e) {
        console.log("/refresh : ", e);
    }
});

router.get("/", (ctx) => {
    ctx.response.body = "Hello World";
});

export { router as User };
