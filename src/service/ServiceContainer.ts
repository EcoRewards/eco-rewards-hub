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
import { GenericRepository } from "../database/GenericRepository";
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
import { Member } from "../member/Member";
import { MemberViewFactory } from "../member/MemberViewFactory";
import { MembersController } from "../member/controller/MembersController";
import { MemberModelFactory } from "../member/MemberModelFactory";
import { BlacklistBodyParser } from "./parser/BlacklistBodyParser";
import { JourneysController } from "../journey/controller/JourneysController";
import { JourneyRepository } from "../journey/repository/JourneyRepository";
import { JourneyCsvToMySqlStreamFactory } from "../journey/stream/JourneyCsvToMySqlStreamFactory";
import { MultiPartFormReader } from "../journey/controller/MultiPartFormReader";
import { AdminUser } from "../user/AdminUser";
import { Journey } from "../journey/Journey";
import { JourneyViewFactory } from "../journey/JourneyViewFactory";
import { JobScheduler } from "./job/JobScheduler";
import { RewardAllocationJob } from "../reward/RewardAllocationJob";
import { RewardRepository } from "../reward/RewardRepository";
import { CarbonSavingPolicy } from "../reward/CarbonSavingPolicy";
import { RewardPointPolicy } from "../reward/RewardPointPolicy";
import { MemberController } from "../member/controller/MemberController";
import { MemberRepository } from "../member/repository/MemberRepository";
import { ExternalMemberRepository } from "../member/repository/ExternalMemberRepository";
import Axios from "axios";
import { TapController } from "../journey/controller/TapController";
import { TapReader } from "../journey/TapReader";
import { DeviceStatus } from "../journey/DeviceStatus";
import { DeviceStatusJsonView } from "../device/DeviceStatus";
import { DeviceStatusViewFactory } from "../device/DeviceStatusViewFactory";
import { DatabaseBackupJob } from "../database/job/DatabaseBackupJob";
import * as S3 from "aws-sdk/clients/s3";
import { JourneyController } from "../journey/controller/JourneyController";
import { promisify } from "util";
import { TapProcessor } from "../journey/TapProcessor";

require("dotenv").config();

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
      new BlacklistBodyParser(["/journey", "/journeys"]),
      this.getLogger()
    );
  }

  public async getJourneyProcessingJob(): Promise<JobScheduler> {
    const db = await this.getDatabase();
    const rewardAllocationJob = new RewardAllocationJob(
      new RewardRepository(db, this.getLogger()),
      new CarbonSavingPolicy(),
      new RewardPointPolicy()
    );

    return new JobScheduler(rewardAllocationJob, 1000, this.getLogger());
  }

  public async getDatabaseBackupJob(): Promise<JobScheduler> {
    const backupJob = new DatabaseBackupJob(this.getDatabaseConfig(), this.getAws());

    return new JobScheduler(backupJob, 3600 * 1000, this.getLogger());
  }

  @memoize
  private getAws(): S3 {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
  }

  private async getRoutes(): Promise<Router> {
    const router = new Router();
    const [
      health,
      login,
      membersController,
      memberController,
      groupReadController,
      groupWriteController,
      deviceReadController,
    ] = await Promise.all([
      this.getHealthController(),
      this.getLoginController(),
      this.getMembersController(),
      this.getMemberController(),
      this.getGroupReadController(),
      this.getGroupWriteController(),
      this.getDeviceStatusReadController(),
    ]);

    const [
      organisationReadController,
      organisationWriteController,
      schemeWriteController,
      schemeReadController,
      journeysController,
      journeyController,
      tapController
    ] = await Promise.all([
      this.getOrganisationReadController(),
      this.getOrganisationWriteController(),
      this.getSchemeWriteController(),
      this.getSchemeReadController(),
      this.getJourneysController(),
      this.getJourneyController(),
      this.getTapController()
    ]);

    return router
      .get("/health", this.wrap(health.get))
      .post("/login", this.wrap(login.post))
      .get("/member/:id", this.wrap(memberController.get))
      .put("/member/:id", this.wrap(memberController.put))
      .post("/member", this.wrap(memberController.post))
      .get("/members", this.wrap(membersController.getAll))
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
      .post("/tap", this.wrap(tapController.post))
      .get("/journeys", this.wrap(journeysController.getAll))
      .post("/journeys", this.wrap(journeysController.post))
      .post("/journey", this.wrap(journeyController.post))
      .get("/devices", this.wrap(deviceReadController.getAll))
      .get("/:type/:id/report", this.wrap(journeysController.getReport));
  }

  // todo this needs a home and a test
  private wrap(controller: Function): Middleware {
    return async (ctx: Context, next: Next) => {
      const input = { ...ctx.request.body, ...ctx.request.query, ...ctx.params };
      const result = await controller(input, ctx);

      if (result) {
        const { code, ...rest } = result;

        ctx.body = rest;
        ctx.status = code || 200;
      }

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

  private async getMembersController(): Promise<MembersController> {
    const [memberRepository, memberViewFactory, externalMemberRepository] = await Promise.all([
      this.getGenericMemberRepository(),
      this.getMemberViewFactory(),
      this.getExternalMemberRepository()
    ]);

    return new MembersController(
      memberRepository,
      memberViewFactory,
      new MemberModelFactory(),
      externalMemberRepository
    );
  }

  private async getDeviceStatusReadController(): Promise<ReadController<DeviceStatus, DeviceStatusJsonView>> {
    return new ReadController(
      await this.getDeviceStatusRepository(),
      new DeviceStatusViewFactory()
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
    const [genericRepository, memberRepository, memberViewFactory, externalMemberRepository] = await Promise.all([
      this.getGenericMemberRepository(),
      this.getMemberRepository(),
      this.getMemberViewFactory(),
      this.getExternalMemberRepository()
    ]);

    return new MemberController(
      memberRepository,
      genericRepository,
      memberViewFactory,
      new MemberModelFactory(),
      externalMemberRepository
    );
  }

  private async getJourneysController(): Promise<JourneysController> {
    const [memberRepository, streamDatabase, database, userRepository] = await Promise.all([
      this.getGenericMemberRepository(),
      this.getDatabaseStream(),
      this.getDatabase(),
      this.getGenericAdminUserRepository()
    ]);

    return new JourneysController(
      new JourneyRepository(streamDatabase, database),
      new JourneyCsvToMySqlStreamFactory(memberRepository),
      new MultiPartFormReader(),
      new JourneyViewFactory(userRepository)
    );
  }

  private async getJourneyController(): Promise<JourneyController> {
    const [journeyRepository, memberRepository] = await Promise.all([
      this.getJourneyRepository(),
      this.getGenericMemberRepository()
    ]);

    const aws = this.getAws();

    return new JourneyController(
      memberRepository,
      journeyRepository,
      new MultiPartFormReader(),
      promisify(aws.upload.bind(aws))
    );
  }
  private async getTapController(): Promise<TapController> {
    const [userRepository, journeyRepository, memberRepository, statusRepository, externalApi] = await Promise.all([
      this.getGenericAdminUserRepository(),
      this.getJourneyRepository(),
      this.getGenericMemberRepository(),
      this.getDeviceStatusRepository(),
      this.getExternalMemberRepository()
    ]);

    const reader = new TapReader(this.getLogger());
    const memberFactory = new MemberModelFactory();

    return new TapController(
      new TapProcessor(reader, journeyRepository, memberRepository, memberFactory, externalApi),
      new JourneyViewFactory(userRepository),
      statusRepository,
      Axios.create(),
      this.getLogger()
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

    return new BasicAuthenticationMiddleware(index, this.getCryptography(), this.getLogger());
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
  public async getDeviceStatusRepository(): Promise<GenericRepository<DeviceStatus>> {
    return new GenericRepository(await this.getDatabase(), "device_status");
  }

  @memoize
  public async getJourneyRepository(): Promise<GenericRepository<Journey>> {
    return new GenericRepository(await this.getDatabase(), "journey");
  }

  @memoize
  public async getGenericAdminUserRepository(): Promise<GenericRepository<AdminUser>> {
    return new GenericRepository(await this.getDatabase(), "admin_user");
  }

  @memoize
  private async getExternalMemberRepository(): Promise<ExternalMemberRepository> {
    return new ExternalMemberRepository(
      Axios.create({
        baseURL: process.env.EXTERNAL_MEMBER_API_URL,
        headers: {
          "Username": process.env.EXTERNAL_MEMBER_API_USERNAME,
          "Password": process.env.EXTERNAL_MEMBER_API_PASSWORD,
          "Api-key": process.env.EXTERNAL_MEMBER_API_KEY
        }
      }),
      await this.getDatabase(),
      this.getLogger()
    );
  }
}
