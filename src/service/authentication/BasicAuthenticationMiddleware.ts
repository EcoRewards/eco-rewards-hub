import { Context, Next } from "koa";
import * as auth from "basic-auth";
import { Cryptography } from "../../cryptography/Cryptography";
import autobind from "autobind-decorator";
import { AdminUserIndex } from "../../user/AdminUserRepository";
import { Logger } from "pino";

/**
 * Implementation of RFC7617, Basic HTTP authentication as a Koa middleware
 */
@autobind
export class BasicAuthenticationMiddleware {

  private readonly whitelist = [
    ctx => ctx.request.path === "/health",
    ctx => ctx.request.path === "/login",
    ctx => ctx.request.path === "/groups",
    ctx => ctx.request.path === "/member",
    ctx => ctx.request.path === "/journey",
    ctx => /^\/scheme\/[\d+]\/report/.test(ctx.request.path),
    ctx => ctx.request.method === "PATCH" && /^\/member\/[\d+]/.test(ctx.request.path)
  ];

  constructor(
    private readonly userCredentials: AdminUserIndex,
    private readonly crypto: Cryptography,
    private readonly logger: Logger
  ) {}

  /**
   * Authenticate a request
   */
  public async auth(ctx: Context, next: Next) {
    if (ctx.request.method === "OPTIONS" || this.whitelist.some(fn => fn(ctx))) {
      return next();
    }

    const user = auth(ctx.req);

    if (user && this.userCredentials[user.name]) {
      const isValid = await this.crypto.compare(user.pass, this.userCredentials[user.name].password);

      if (isValid) {
        ctx.adminUserId = this.userCredentials[user.name].id;

        return next();
      }
    }

    this.logger.info(`401 ${ctx.method} ${ctx.url}`);

    return ctx.throw(
      401,
      {
        headers: {
          "WWW-Authenticate": "Basic realm=\"Secure Area\""
        }
      }
    );
  }
}
