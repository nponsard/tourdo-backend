import { Context, RouterContext } from "https://deno.land/x/oak/mod.ts";
/**
 * Sends a JSON-formatted response to a request.
 *
 * @param ctx Request context
 * @param response Response object
 * @param code the http code to send
 */
export const SendJSONResponse = <T>(
  ctx: Context<Record<string, unknown>>,
  response: T,
  code = 200
): void => {
  if (ctx.response.writable) {
    // Set content type to application/json and stringify the response object
    ctx.response.headers.append("Content-Type", "application/json");
    ctx.response.body = JSON.stringify(response);
    ctx.response.status = code;
  }
};


export const Prefix = "/api/v1";