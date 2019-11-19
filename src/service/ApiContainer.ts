import { KoaService } from "./KoaService";
import { config } from "../../config/service";
import * as Koa from "koa";
import * as pino from "pino";
import * as Router from "koa-router";
import { HealthController } from "../health/HealthController";
import { ParameterizedContext } from "koa";
import { Logger } from "pino";
import * as memoize from "memoized-class-decorator";

/**
 * Dependency container for the API
 */
export class ApiContainer {

  public getKoaService(): KoaService {
    return new KoaService(
      config.port,
      new Koa(),
      this.getRoutes(),
      this.getLogger()
    );
  }

  private getRoutes(): Router {
    const router = new Router();

    return router
      .get("/health", this.wrap(this.getHealthController().get));
  }

  private wrap(controller: Function) {
    return async (ctx: ParameterizedContext, next: () => Promise<any>) => {
      try {
        const input = ctx.request.query ? ctx.response.body : ctx.request.query;
        ctx.body = await controller(input, ctx);
        await next();
      }
      catch (err) {
        this.getLogger().error(err);

        if (err.httpCode) {
          ctx.throw(err.httpCode, err.message);
        } else {
          ctx.throw(500, err);
        }
      }
    };
  }

  private getHealthController(): HealthController {
    return new HealthController();
  }

  @memoize
  private getLogger(): Logger {
    return pino({ prettyPrint: { translateTime: true } });
  }
}
