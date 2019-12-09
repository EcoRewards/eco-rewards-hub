import { Logger } from "pino";
import * as Koa from "koa";
import * as compress from "koa-compress";
import * as cors from "@koa/cors";
import * as Router from "koa-router";
import { BasicAuthenticationMiddleware } from "./authentication/BasicAuthenticationMiddleware";
import { ui, validate } from "swagger2-koa";
import { Document } from "swagger2/dist/schema";
import * as bodyParser from "koa-bodyparser";
import autobind from "autobind-decorator";
import { ErrorLoggingMiddleware } from "./logging/ErrorLoggingMiddleware";
import { RequestLoggingMiddleware } from "./logging/RequestLoggingMiddleware";
import { Context, Next } from "koa";
import { BlacklistBodyParser } from "./parser/BlacklistBodyParser";

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
    private readonly errorLogger: ErrorLoggingMiddleware,
    private readonly requestLogger: RequestLoggingMiddleware,
    private readonly blacklistBodyParser: BlacklistBodyParser,
    private readonly logger: Logger
  ) {}

  /**
   * Start the API on the configured port, set up cors and compression.
   */
  public start(): void {
    this.app
      .use(ui(this.swaggerDocument, "/swagger"))
      .use(this.errorLogger.errorHandler)
      .use(this.requestLogger.requestLogger)
      .use(compress())
      .use(cors({ origin: "*" }))
      .use(this.blacklistBodyParser.disableBodyParser)
      .use(bodyParser())
      .use(this.authentication.auth)
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .use(validate(this.swaggerDocument))
      .listen(this.port);

    this.logger.info(`Started on ${this.port}`);
  }

}
