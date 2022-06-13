import { keyValue } from "ts-array-utils";
import { Context, Next } from "koa";
import autobind from "autobind-decorator";

/**
 * Disable body parser for the blacklisted requests
 */
@autobind
export class BlacklistBodyParser {
  private readonly endpoints: Record<string, boolean>;

  constructor(blacklist: string[]) {
    this.endpoints = blacklist.reduce(keyValue(item => [item, true]), {});
  }

  /**
   * Middleware handler. Looks up the given request path to see if it should disable
   * the body parser.
   */
  public async disableBodyParser(ctx: Context, next: Next) {
    ctx.disableBodyParser = this.endpoints[ctx.path] && ctx.headers["content-type"] !== "application/json";

    await next();
  }

}
