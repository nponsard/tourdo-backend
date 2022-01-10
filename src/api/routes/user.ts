import { Router } from "https://deno.land/x/oak/mod.ts";

import { Prefix } from "../utils.ts";

const router = new Router({ prefix: `${Prefix}/user` });

router.post("/register", (ctx) => {
  console.log(ctx);
});

router.post("/login", (ctx) => {
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
