import { Context, Next } from "koa";
import * as auth from "basic-auth";
import { Cryptography } from "../../cryptography/Cryptography";
import autobind from "autobind-decorator";
import { AdminUserIndex } from "../../user/AdminUserRepository";

/**
 * Implementation of RFC7617, Basic HTTP authentication as a Koa middleware
 */
@autobind
export class BasicAuthenticationMiddleware {

  // todo add the user auth endpoint
  private readonly whitelist = [
    "/health",
    "/login"
  ];

  // todo reload / mutate this when adding new orgs otherwise they won't authenticate
  constructor(
    private readonly userCredentials: AdminUserIndex,
    private readonly crypto: Cryptography
  ) {}

  /**
   * Authenticate a request
   */
  public async auth(ctx: Context, next: Next) {
    if (this.whitelist.includes(ctx.request.path)) {
      return next();
    }

    const user = auth(ctx.req);

    if (user && this.userCredentials[user.name]) {
      const isValid = await this.crypto.compare(user.pass, this.userCredentials[user.name].password);

      if (isValid) {
        return next();
      }
    }

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
