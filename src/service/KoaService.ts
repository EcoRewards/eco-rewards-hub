import { Logger } from "pino";
import * as Koa from "koa";
import * as compress from "koa-compress";
import * as cors from "@koa/cors";
import * as Router from "koa-router";

/**
 * Koa Wrapper that starts the API.
 */
export class KoaService {

  constructor(
    private readonly port: number,
    private readonly app: Koa,
    private readonly router: Router,
    private readonly logger: Logger
  ) {}

  /**
   * Start the API on the configured port, set up cors and compression.
   */
  public start(): void {
    this.app
      .use(compress())
      .use(cors({ origin: "*" }))
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .listen(this.port);

    this.logger.info(`Started on ${this.port}`);
  }

}