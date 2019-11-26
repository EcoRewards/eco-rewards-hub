import { Context, Next } from "koa";
import { Logger } from "pino";

/**
 * Koa middleware to log requests with pino
 */
export class RequestLoggingMiddleware {

  constructor(
    private readonly logger: Logger
  ) { }

  /**
   * Log the request info and response time
   */
  public async requestLogger(ctx: Context, next: Next) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;

    this.logger.info(`${ctx.status} ${ctx.method} ${ctx.url} - ${ms}ms`);
    ctx.set("X-Response-Time", `${ms}ms`);
  }

}