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
import { ReadController } from "./controller/ReadController";
import { DatabaseRecord, GenericRepository } from "../database/GenericRepository";
import { LoginController } from "../user/controller/LoginController";
import { OrganisationViewFactory } from "../organisation/OrganisationViewFactory";
import { Organisation, OrganisationJsonView } from "../organisation/Organisation";
import { Scheme, SchemeJsonView } from "../scheme/Scheme";
import { SchemeViewFactory } from "../scheme/SchemeViewFactory";
import { WriteController } from "./controller/WriteController";
import { SchemeModelFactory } from "../scheme/SchemeModelFactory";
import { OrganisationModelFactory } from "../organisation/OrganisationModelFactory";
import { ErrorLoggingMiddleware } from "./logging/ErrorLoggingMiddleware";
import { RequestLoggingMiddleware } from "./logging/RequestLoggingMiddleware";
import { Group, GroupJsonView } from "../group/Group";
import { GroupViewFactory } from "../group/GroupViewFactory";
import { GroupModelFactory } from "../group/GroupModelFactory";
import { Member, MemberJsonView } from "../member/Member";
import { MemberViewFactory } from "../member/MemberViewFactory";
import { MembersController } from "../member/controller/MembersController";
import { MemberModelFactory } from "../member/MemberModelFactory";
import { BlacklistBodyParser } from "./parser/BlacklistBodyParser";
import { JourneyController } from "../journey/controller/JourneyController";
import { JourneyRepository } from "../journey/repository/JourneyRepository";
import { JourneyCsvToMySqlStreamFactory } from "../journey/stream/JourneyCsvToMySqlStreamFactory";
import { MultiPartFileExtractor } from "../journey/controller/MultiPartFileExtractor";
import { AdminUser } from "../user/AdminUser";
import { Journey, JourneyJsonView } from "../journey/Journey";
import { JourneyViewFactory } from "../journey/JourneyViewFactory";
import { JobScheduler } from "./job/JobScheduler";
import { RewardAllocationJob } from "../reward/RewardAllocationJob";
import { RewardRepository } from "../reward/RewardRepository";
import { CarbonSavingPolicy } from "../reward/CarbonSavingPolicy";
import { RewardPointPolicy } from "../reward/RewardPointPolicy";
import { MemberController } from "../member/controller/MemberController";
import { MemberRepository } from "../member/repository/MemberRepository";

/**
 * Dependency container for the API
 */
export class ServiceContainer {

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
      new BlacklistBodyParser(["/journey"]),
      this.getLogger()
    );
  }

  public async getJobScheduler(): Promise<JobScheduler> {
    const db = await this.getDatabase();
    const rewardAllocationJob = new RewardAllocationJob(
      new RewardRepository(db),
      new CarbonSavingPolicy(),
      new RewardPointPolicy()
    );

    return new JobScheduler(rewardAllocationJob, 1000, this.getLogger());
  }

  private async getRoutes(): Promise<Router> {
    const router = new Router();
    const [
      health,
      login,
      memberReadController,
      membersController,
      memberController,
      groupReadController,
      groupWriteController,
    ] = await Promise.all([
      this.getHealthController(),
      this.getLoginController(),
      this.getMemberReadController(),
      this.getMembersController(),
      this.getMemberController(),
      this.getGroupReadController(),
      this.getGroupWriteController(),
    ]);

    const [
      organisationReadController,
      organisationWriteController,
      schemeWriteController,
      schemeReadController,
      journeyController
    ] = await Promise.all([
      this.getOrganisationReadController(),
      this.getOrganisationWriteController(),
      this.getSchemeWriteController(),
      this.getSchemeReadController(),
      this.getJourneyController()
    ]);

    return router
      .get("/health", this.wrap(health.get))
      .post("/login", this.wrap(login.post))
      .get("/members", this.wrap(memberReadController.getAll))
      .get("/member/:id", this.wrap(memberController.get))
      .post("/member", this.wrap(memberController.post))
      .post("/members", this.wrap(membersController.post))
      .get("/groups", this.wrap(groupReadController.getAll))
      .get("/group/:id", this.wrap(groupReadController.get))
      .put("/group/:id", this.wrap(groupWriteController.put))
      .delete("/group/:id", this.wrap(groupWriteController.delete))
      .post("/group", this.wrap(groupWriteController.post))
      .get("/organisations", this.wrap(organisationReadController.getAll))
      .get("/organisation/:id", this.wrap(organisationReadController.get))
      .put("/organisation/:id", this.wrap(organisationWriteController.put))
      .delete("/organisation/:id", this.wrap(organisationWriteController.delete))
      .post("/organisation", this.wrap(organisationWriteController.post))
      .get("/schemes", this.wrap(schemeReadController.getAll))
      .get("/scheme/:id", this.wrap(schemeReadController.get))
      .put("/scheme/:id", this.wrap(schemeWriteController.put))
      .delete("/scheme/:id", this.wrap(schemeWriteController.delete))
      .post("/scheme", this.wrap(schemeWriteController.post))
      .get("/journeys", this.wrap(journeyController.getAll))
      .post("/journey", this.wrap(journeyController.post));
  }

  // todo this needs a home and a test
  private wrap(controller: Function): Middleware {
    return async (ctx: Context, next: Next) => {
      const input = { ...ctx.request.body, ...ctx.request.query, ...ctx.params };
      const { code, ...rest } = await controller(input, ctx);
      ctx.body = rest;
      ctx.status = code || 200;
      return next();
    };
  }

  private getHealthController(): HealthController {
    return new HealthController();
  }

  private async getGroupReadController(): Promise<ReadController<Group, GroupJsonView>> {
    const [groupRepository, viewFactory] = await Promise.all([
      this.getMemberGroupRepository(),
      this.getGroupViewFactory()
    ]);

    return new ReadController(groupRepository, viewFactory);
  }

  private async getGroupWriteController(): Promise<WriteController<GroupJsonView, Group>> {
    const [groupRepository, viewFactory] = await Promise.all([
      this.getMemberGroupRepository(),
      this.getGroupViewFactory()
    ]);

    return new WriteController(
      groupRepository,
      new GroupModelFactory(),
      viewFactory
    );
  }

  private async getOrganisationReadController(): Promise<ReadController<Organisation, OrganisationJsonView>> {
    const [organisationRepository, viewFactory] = await Promise.all([
      this.getOrganisationRepository(),
      this.getOrganisationViewFactory()
    ]);

    return new ReadController(organisationRepository, viewFactory);
  }

  private async getOrganisationWriteController(): Promise<WriteController<OrganisationJsonView, Organisation>> {
    const [organisationRepository, viewFactory] = await Promise.all([
      this.getOrganisationRepository(),
      this.getOrganisationViewFactory()
    ]);

    return new WriteController(
      organisationRepository,
      new OrganisationModelFactory(),
      viewFactory
    );
  }

  private async getSchemeWriteController(): Promise<WriteController<SchemeJsonView, Scheme>> {
    return new WriteController(
      await this.getSchemeRepository(),
      new SchemeModelFactory(),
      new SchemeViewFactory()
    );
  }

  private async getSchemeReadController(): Promise<ReadController<Scheme, SchemeJsonView>> {
    return new ReadController(
      await this.getSchemeRepository(),
      new SchemeViewFactory()
    );
  }

  private async getMemberReadController(): Promise<ReadController<Member, MemberJsonView>> {
    const [groupRepository, memberRepository, viewFactory] = await Promise.all([
        this.getMemberGroupRepository(),
        this.getGenericMemberRepository(),
        this.getGroupViewFactory()
      ]);

    return new ReadController(
      memberRepository,
      new MemberViewFactory(
        groupRepository,
        viewFactory
      )
    );
  }

  private async getMembersController(): Promise<MembersController> {
    const [memberRepository, memberViewFactory] = await Promise.all([
      this.getGenericMemberRepository(),
      this.getMemberViewFactory()
    ]);

    return new MembersController(
      memberRepository,
      memberViewFactory,
      new MemberModelFactory()
    );
  }

  @memoize
  private async getMemberViewFactory(): Promise<MemberViewFactory> {
    const [groupRepository, viewFactory] = await Promise.all([
        this.getMemberGroupRepository(),
        this.getGroupViewFactory()
      ]);

    return new MemberViewFactory(
      groupRepository,
      viewFactory
    );
  }

  private async getMemberController(): Promise<MemberController> {
    const [genericRepository, memberRepository, memberViewFactory] = await Promise.all([
      this.getGenericMemberRepository(),
      this.getMemberRepository(),
      this.getMemberViewFactory()
    ]);

    return new MemberController(
      memberRepository,
      genericRepository,
      memberViewFactory,
      new MemberModelFactory()
    );
  }

  private async getJourneyController(): Promise<JourneyController> {
    const [memberRepository, streamDatabase, database, userRepository] = await Promise.all([
      this.getGenericMemberRepository(),
      this.getDatabaseStream(),
      this.getDatabase(),
      this.getGenericAdminUserRepository()
    ]);

    return new JourneyController(
      new JourneyRepository(streamDatabase, database),
      new JourneyCsvToMySqlStreamFactory(memberRepository),
      new MultiPartFileExtractor(),
      new JourneyViewFactory(userRepository)
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
    return require("mysql2/promise").createPool(this.getDatabaseConfig());
  }

  @memoize
  private getDatabaseStream(): Promise<any> {
    return require("mysql2").createPool(this.getDatabaseConfig());
  }

  @memoize
  private getDatabaseConfig() {
    const env = process.env.NODE_ENV || databaseConfiguration.defaultEnv;
    const envConfig = databaseConfiguration[env];

    return {
      host: envConfig.host,
      user: envConfig.user,
      password: envConfig.password,
      database: envConfig.database,
      dateStrings: true,
      // debug: ["ComQueryPacket", "RowDataPacket"]
    };

  }

  @memoize
  private async getMemberRepository(): Promise<MemberRepository> {
    return new MemberRepository(await this.getDatabase());
  }

  @memoize
  private async getOrganisationViewFactory(): Promise<OrganisationViewFactory> {
    return new OrganisationViewFactory(
      await this.getSchemeRepository(),
      new SchemeViewFactory()
    );
  }

  @memoize
  private async getGroupViewFactory(): Promise<GroupViewFactory> {
    const [organisationRepository, organisationViewFactory] = await Promise.all([
      this.getOrganisationRepository(),
      this.getOrganisationViewFactory()
    ]);

    return new GroupViewFactory(organisationRepository, organisationViewFactory);
  }

  @memoize
  private getCryptography(): Cryptography {
    return new Cryptography();
  }

  @memoize
  private getSwaggerDocument(): Document {
    return swagger.loadDocumentSync("documentation/swagger/api.yaml") as Document;
  }

  @memoize
  public async getSchemeRepository(): Promise<GenericRepository<Scheme>> {
    return new GenericRepository(await this.getDatabase(), "scheme", { "organisation": "scheme_id" });
  }

  @memoize
  public async getOrganisationRepository(): Promise<GenericRepository<Organisation>> {
    return new GenericRepository(await this.getDatabase(), "organisation", { "group": "organisation_id" });
  }

  @memoize
  public async getMemberGroupRepository(): Promise<GenericRepository<Group>> {
    return new GenericRepository(await this.getDatabase(), "member_group", { "member": "member_group_id" });
  }

  @memoize
  public async getGenericMemberRepository(): Promise<GenericRepository<Member>> {
    return new GenericRepository(await this.getDatabase(), "member");
  }

  @memoize
  public async getJourneyRepository(): Promise<GenericRepository<Journey>> {
    return new GenericRepository(await this.getDatabase(), "journey");
  }

  @memoize
  public async getGenericAdminUserRepository(): Promise<GenericRepository<AdminUser>> {
    return new GenericRepository(await this.getDatabase(), "admin_user");
  }

}
