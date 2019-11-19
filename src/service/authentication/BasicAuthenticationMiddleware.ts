import { Context, Next } from "koa";
import * as auth from "basic-auth";
import { Cryptography } from "../../cryptography/Cryptography";
import { OrganisationId } from "../../organisation/Organisation";
import autobind from "autobind-decorator";

/**
 * Implementation of RFC7617, Basic HTTP authentication as a Koa middleware
 */
@autobind
export class BasicAuthenticationMiddleware {

  // todo reload / mutate this when adding new orgs otherwise they won't authenticate
  constructor(
    private readonly userCredentials: PasswordIndex,
    private readonly crypto: Cryptography
  ) {}

  /**
   * Authenticate a request
   */
  public async auth(ctx: Context, next: Next) {
    const user = auth(ctx.req);

    if (user && this.userCredentials[user.name]) {
      const isValid = await this.crypto.compare(user.pass, this.userCredentials[user.name]);

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

export type PasswordIndex = Record<OrganisationId, string>;

