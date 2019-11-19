import { KoaService } from "./KoaService";
import { config } from "../../config/service";
import * as Koa from "koa";
import * as pino from "pino";
import * as Router from "koa-router";
import { HealthController } from "../health/HealthController";
import { ParameterizedContext } from "koa";
import { Logger } from "pino";
import * as memoize from "memoized-class-decorator";
import * as databaseConfiguration from "../../config/database.json";
import { BasicAuthenticationMiddleware } from "./authentication/BasicAuthenticationMiddleware";
import { OrganisationAuthenticationRepository } from "./authentication/OrganisationAuthenticationRepository";
import { Cryptography } from "../cryptography/Cryptography";

/**
 * Dependency container for the API
 */
export class ApiContainer {

  public async getKoaService(): Promise<KoaService> {
    return new KoaService(
      config.port,
      new Koa(),
      this.getRoutes(),
      await this.getAuthenticationMiddleware(),
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

  private async getAuthenticationMiddleware(): Promise<BasicAuthenticationMiddleware> {
    const db = await this.getDatabase();
    const repository = new OrganisationAuthenticationRepository(db);
    const index = await repository.getPasswordIndex();

    return new BasicAuthenticationMiddleware(index, this.getCryptography());
  }

  @memoize
  private getDatabase(): Promise<any> {
    const env = process.env.NODE_ENV || databaseConfiguration.defaultEnv;
    const config = databaseConfiguration[env];

    return require("mysql2/promise").createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      dateStrings: true,
      // debug: ["ComQueryPacket", "RowDataPacket"]
    });
  }

  @memoize
  private getCryptography(): Cryptography {
    return new Cryptography();
  }
}
