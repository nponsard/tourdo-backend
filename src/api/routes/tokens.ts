import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { SendJSONResponse, ParseBodyJSON } from "../utils.ts";
import { Prefix } from "../utils.ts";
import {
    CreateUser,
    GetUserByUsername,
    GetUserAuth,
} from "../../database/entities/user.ts";
import {
    CreateToken,
    GetTokensWithRefreshToken,
} from "../../database/entities/token.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

import { DecodeJWT } from "../../jwt/mod.ts";
import { NewTokenPair } from "../../jwt/tokens.ts";

const router = new Router({ prefix: `${Prefix}/tokens` });

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
        const newTokens = await NewTokenPair(tokens.userId);

        // save token

        await CreateToken(
            ctx.app.state.pool,
            tokens.userId,
            newTokens.accessToken,
            new Date(Date.now() + 3600 * 1000),
            newTokens.refreshToken,
            new Date(Date.now() + 3600 * 1000 * 24 * 30)
        );

        SendJSONResponse(ctx, {
            accessToken: newTokens.accessJWT,
            refreshToken: newTokens.refreshJWT,
        });
    } catch (e) {
        console.log("/refresh : ", e);
    }
});

export { router as Tokens };
