import { Logger } from "pino";
import * as Koa from "koa";
import * as compress from "koa-compress";
import * as cors from "@koa/cors";

/**
 * Koa Wrapper that starts the API.
 */
export class KoaService {

  constructor(
    private readonly port: number,
    private readonly app: Koa,
    private readonly logger: Logger
  ) {}

  public start(): void {
    this.app
      .use(compress())
      .use(cors({ origin: '*' }))
      .listen(this.port);

    this.logger.info(`Started on ${this.port}`);
  }
}
