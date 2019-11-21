import { Logger } from "pino";
import * as Koa from "koa";
import * as compress from "koa-compress";
import * as cors from "@koa/cors";
import * as Router from "koa-router";
import { BasicAuthenticationMiddleware } from "./authentication/BasicAuthenticationMiddleware";
import { ui, validate } from "swagger2-koa";
import { Document } from "swagger2/dist/schema";
import * as bodyParser from "koa-bodyparser";
import { Context, Next } from "koa";
import autobind from "autobind-decorator";

/**
 * Koa Wrapper that starts the API.
 */
@autobind
export class KoaService {

  constructor(
    private readonly port: number,
    private readonly app: Koa,
    private readonly router: Router,
    private readonly authentication: BasicAuthenticationMiddleware,
    private readonly swaggerDocument: Document,
    private readonly logger: Logger
  ) {}

  /**
   * Start the API on the configured port, set up cors and compression.
   */
  public start(): void {
    // todo add exception logging
    this.app
      .use(this.requestLogger)
      .use(compress())
      .use(ui(this.swaggerDocument, "/swagger"))
      .use(cors({ origin: "*" }))
      .use(bodyParser())
      .use(this.authentication.auth)
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .use(validate(this.swaggerDocument))
      .listen(this.port);

    this.logger.info(`Started on ${this.port}`);
  }

  /**
   * Log the request info and response time
   */
  private async requestLogger(ctx: Context, next: Next) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;

    this.logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
    ctx.set("X-Response-Time", `${ms}ms`);
  }

}
