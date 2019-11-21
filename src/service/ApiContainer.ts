import { KoaService } from "./KoaService";
import { config } from "../../config/service";
import * as Koa from "koa";
import * as pino from "pino";
import * as Router from "koa-router";
import { HealthController } from "../health/HealthController";
import { Context, Middleware, Next, ParameterizedContext } from "koa";
import { Logger } from "pino";
import * as memoize from "memoized-class-decorator";
import * as databaseConfiguration from "../../config/database.json";
import { BasicAuthenticationMiddleware } from "./authentication/BasicAuthenticationMiddleware";
import { AuthenticationCredentialsRepository } from "./authentication/AuthenticationCredentialsRepository";
import { Cryptography } from "../cryptography/Cryptography";
import { Document } from "swagger2/dist/schema";
import * as swagger from "swagger2";
import { OrganisationsController } from "../organisation/controller/OrganisationsController";
import { GenericRepository } from "../database/GenericRepository";
import { SchemeRepository } from "../scheme/SchemeRepository";
import { LoginController } from "../user/controller/LoginController";

/**
 * Dependency container for the API
 */
export class ApiContainer {

  public async getKoaService(): Promise<KoaService> {
    const [router, authenticationMiddleware] = await Promise.all([
      this.getRoutes(),
      this.getAuthenticationMiddleware()
    ]);

    return new KoaService(
      config.port,
      new Koa(),
      router,
      authenticationMiddleware,
      this.getSwaggerDocument(),
      this.getLogger()
    );
  }

  private async getRoutes(): Promise<Router> {
    const router = new Router();
    const [health, login, organisations] = await Promise.all([
      this.getHealthController(),
      this.getLoginController(),
      this.getOrganisationsController()
    ]);

    return router
      .get("/health", this.wrap(health.get))
      .post("/login", this.wrap(login.post))
      .get("/organisations", this.wrap(organisations.get));
  }

  private wrap(controller: Function): Middleware {
    return async (ctx: Context, next: Next) => {
      try {
        const input = ctx.request.body || ctx.request.query;
        const { data, links, code } = await controller(input, ctx);
        ctx.body = { data, links};
        ctx.status = code || 200;
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

  private async getOrganisationsController(): Promise<OrganisationsController> {
    const [genericRepository, schemeRepository] = await Promise.all([
      this.getGenericRepository(),
      this.getSchemeRepository()
    ]);

    return new OrganisationsController(genericRepository, schemeRepository);
  }

  private async getLoginController(): Promise<LoginController> {
    const genericRepository = await this.getGenericRepository();

    return new LoginController(genericRepository, this.getCryptography());
  }

  @memoize
  private getLogger(): Logger {
    return pino({ prettyPrint: { translateTime: true } });
  }

  private async getAuthenticationMiddleware(): Promise<BasicAuthenticationMiddleware> {
    const db = await this.getDatabase();
    const repository = new AuthenticationCredentialsRepository(db);
    const index = await repository.getPasswordIndex();

    return new BasicAuthenticationMiddleware(index, this.getCryptography());
  }

  @memoize
  private getDatabase(): Promise<any> {
    const env = process.env.NODE_ENV || databaseConfiguration.defaultEnv;
    const envConfig = databaseConfiguration[env];

    return require("mysql2/promise").createPool({
      host: envConfig.host,
      user: envConfig.user,
      password: envConfig.password,
      database: envConfig.database,
      dateStrings: true,
      // debug: ["ComQueryPacket", "RowDataPacket"]
    });
  }

  @memoize
  private async getGenericRepository(): Promise<GenericRepository> {
    return new GenericRepository(await this.getDatabase());
  }

  @memoize
  private async getSchemeRepository(): Promise<SchemeRepository> {
    return new SchemeRepository(await this.getDatabase());
  }

  @memoize
  private getCryptography(): Cryptography {
    return new Cryptography();
  }

  @memoize
  private getSwaggerDocument(): Document {
    return swagger.loadDocumentSync("documentation/swagger/api.yaml") as Document;
  }

}
