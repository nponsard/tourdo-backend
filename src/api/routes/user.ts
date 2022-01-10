import { Router } from "https://deno.land/x/oak/mod.ts";

import { Prefix } from "../utils.ts";

const router = new Router({ prefix: `${Prefix}/user` });

router.post("/register", (ctx) => {
  console.log(ctx);
});

export { router as User };
