import { KoaService } from "./KoaService";
import { config } from "../../config/service";
import * as Koa from "koa";
import { Context, Middleware, Next } from "koa";
import * as pino from "pino";
import { Logger } from "pino";
import * as Router from "koa-router";
import { HealthController } from "../health/HealthController";
import * as memoize from "memoized-class-decorator";
import * as databaseConfiguration from "../../config/database.json";
import { BasicAuthenticationMiddleware } from "./authentication/BasicAuthenticationMiddleware";
import { AdminUserRepository } from "../user/AdminUserRepository";
import { Cryptography } from "../cryptography/Cryptography";
import { Document } from "swagger2/dist/schema";
import * as swagger from "swagger2";
import { GenericGetController } from "./controller/GenericGetController";
import { DatabaseRecord, GenericRepository } from "../database/GenericRepository";
import { LoginController } from "../user/controller/LoginController";
import { OrganisationViewFactory } from "../organisation/OrganisationViewFactory";
import { Organisation, OrganisationJsonView } from "../organisation/Organisation";
import { Scheme, SchemeJsonView } from "../scheme/Scheme";
import { SchemeViewFactory } from "../scheme/SchemeViewFactory";
import { GenericPostController } from "./controller/GenericPostController";
import { SchemeModelFactory } from "../scheme/SchemeModelFactory";
import { OrganisationModelFactory } from "../organisation/OrganisationModelFactory";
import { ErrorLoggingMiddleware } from "./logging/ErrorLoggingMiddleware";
import { RequestLoggingMiddleware } from "./logging/RequestLoggingMiddleware";
import { Group, GroupJsonView } from "../group/Group";
import { GroupViewFactory } from "../group/GroupViewFactory";
import { GroupModelFactory } from "../group/GroupModelFactory";

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
      new ErrorLoggingMiddleware(this.getLogger()),
      new RequestLoggingMiddleware(this.getLogger()),
      this.getLogger()
    );
  }

  private async getRoutes(): Promise<Router> {
    const router = new Router();
    const [
      health,
      login,
      groupGet,
      groupPost,
      organisationGet,
      organisationPost,
      schemePost,
      schemeGet
    ] = await Promise.all([
      this.getHealthController(),
      this.getLoginController(),
      this.getGroupGetController(),
      this.getGroupPostController(),
      this.getOrganisationGetController(),
      this.getOrganisationPostController(),
      this.getSchemePostController(),
      this.getSchemeGetController()
    ]);

    return router
      .get("/health", this.wrap(health.get))
      .post("/login", this.wrap(login.post))
      .get("/groups", this.wrap(groupGet.getAll))
      .get("/group/:id", this.wrap(groupGet.get))
      .post("/group", this.wrap(groupPost.post))
      .get("/organisations", this.wrap(organisationGet.getAll))
      .get("/organisation/:id", this.wrap(organisationGet.get))
      .post("/organisation", this.wrap(organisationPost.post))
      .get("/schemes", this.wrap(schemeGet.getAll))
      .get("/scheme/:id", this.wrap(schemeGet.get))
      .post("/scheme", this.wrap(schemePost.post));
  }

  // todo this needs a home and a test
  private wrap(controller: Function): Middleware {
    return async (ctx: Context, next: Next) => {
      const input = ctx.request.body || ctx.request.query;
      const { data, links, code } = await controller(input, ctx);
      ctx.body = { data, links};
      ctx.status = code || 200;
      return next();
    };
  }

  private getHealthController(): HealthController {
    return new HealthController();
  }

  private async getGroupGetController(): Promise<GenericGetController<Group, GroupJsonView>> {
    const [groupRepository, viewFactory] = await Promise
        .all<GenericRepository<Group>, GroupViewFactory>([
          this.getGenericRepository("member_group"),
          this.getGroupViewFactory()
        ]);

    return new GenericGetController(groupRepository, viewFactory);
  }

  private async getGroupPostController(): Promise<GenericPostController<GroupJsonView, Group>> {
    const [groupRepository, viewFactory] = await Promise
        .all<GenericRepository<Group>, GroupViewFactory>([
          this.getGenericRepository("member_group"),
          this.getGroupViewFactory()
        ]);

    return new GenericPostController(
        groupRepository,
        new GroupModelFactory(),
        viewFactory
    );
  }

  private async getOrganisationGetController(): Promise<GenericGetController<Organisation, OrganisationJsonView>> {
    const [organisationRepository, viewFactory] = await Promise
      .all<GenericRepository<Organisation>, OrganisationViewFactory>([
        this.getGenericRepository("organisation"),
        this.getOrganisationViewFactory()
      ]);

    return new GenericGetController(organisationRepository, viewFactory);
  }

  private async getOrganisationPostController(): Promise<GenericPostController<OrganisationJsonView, Organisation>> {
    const [organisationRepository, viewFactory] = await Promise
      .all<GenericRepository<Organisation>, OrganisationViewFactory>([
        this.getGenericRepository("organisation"),
        this.getOrganisationViewFactory()
      ]);

    return new GenericPostController(
      organisationRepository,
      new OrganisationModelFactory(),
      viewFactory
    );
  }

  private async getSchemePostController(): Promise<GenericPostController<SchemeJsonView, Scheme>> {
    return new GenericPostController(
      await this.getGenericRepository("scheme"),
      new SchemeModelFactory(),
      new SchemeViewFactory()
    );
  }

  private async getSchemeGetController(): Promise<GenericGetController<Scheme, SchemeJsonView>> {
    return new GenericGetController(
      await this.getGenericRepository("scheme"),
      new SchemeViewFactory()
    );
  }

  @memoize
  private async getAdminUserRepository(): Promise<AdminUserRepository> {
    return new AdminUserRepository(await this.getDatabase());
  }

  private async getLoginController(): Promise<LoginController> {
    const repository = await this.getAdminUserRepository();

    return new LoginController(repository, this.getCryptography());
  }

  @memoize
  private getLogger(): Logger {
    return pino({ prettyPrint: { translateTime: true } });
  }

  private async getAuthenticationMiddleware(): Promise<BasicAuthenticationMiddleware> {
    const repository = await this.getAdminUserRepository();
    const index = await repository.getUserIndex();

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
  private async getGenericRepository<T extends DatabaseRecord>(table: string): Promise<GenericRepository<T>> {
    return new GenericRepository(await this.getDatabase(), table);
  }

  @memoize
  private async getOrganisationViewFactory(): Promise<OrganisationViewFactory> {
    return new OrganisationViewFactory(
      await this.getGenericRepository("scheme")
    );
  }

  @memoize
  private async getGroupViewFactory(): Promise<GroupViewFactory> {
    return new GroupViewFactory(
        await this.getGenericRepository("organisation")
    );
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
