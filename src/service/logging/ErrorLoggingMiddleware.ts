import { Context, Next } from "koa";
import { Logger } from "pino";

/**
 * Koa middleware that logs errors to a pino logger
 */
export class ErrorLoggingMiddleware {

  constructor(
    private readonly logger: Logger
  ) { }

  /**
   * Put a try/catch around subsequent middlewares to catch any exceptions and provide an appropriate REST response.
   *
   * There is also a check for a 500 status as the swagger plugin does not throw an exception.
   */
  public async errorHandler(ctx: Context, next: Next) {
    try {
      await next();

      if (ctx.status === 500) {
        this.logger.error(ctx.body);
      }
    }
    catch (err) {
      this.logger.error(err);

      if (err.httpCode) {
        ctx.throw(err.httpCode, err.message);
      } else {
        ctx.throw(500, err);
      }
    }
  }

}