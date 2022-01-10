import { Router } from "https://deno.land/x/oak@v10.1.0/mod.ts";

import { SendJSONResponse } from "../utils.ts";

import { Prefix } from "../utils.ts";

const router = new Router({ prefix: `${Prefix}/user` });

router.post("/register", (ctx) => {
  console.log(ctx.request.hasBody);
  return ctx.request
    .body({ type: "json" })
    .value.then((val) => {
      console.log(val);
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
