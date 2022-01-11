import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";

import { SendJSONResponse } from "../utils.ts";

import { Prefix } from "../utils.ts";

import { CreateUser, GetUserByUsername } from "../../database/entities/user.ts";
import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";

const router = new Router<{ pool: Pool }>({ prefix: `${Prefix}/user` });

router.post("/register", (ctx) => {
    console.log(ctx.request.hasBody);
    return ctx.request
        .body({ type: "json" })
        .value.then((val: { password: string; username: string }) => {
            GetUserByUsername(ctx.state.pool, val.username)
                .then((user) => {
                    if (user) {
                        SendJSONResponse(
                            ctx,
                            { message: "User already exists" },
                            400
                        );
                    } else {
                        CreateUser(
                            ctx.state.pool,
                            val.username,
                            val.password
                        ).then((user) => {
                            SendJSONResponse(ctx, user);
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

            if (val.username) {
                ctx.response.body = {
                    message: "success",
                };
            }
        })
        .catch((err) => {
            console.log(err);
            SendJSONResponse(ctx, { message: "Bad request" }, 400);
        });
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
