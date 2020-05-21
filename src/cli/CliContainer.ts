import { CliCommand } from "./CliCommand";
import { CreateSchemeCommand } from "../scheme/command/CreateSchemeCommand";
import * as memoize from "memoized-class-decorator";
import * as databaseConfiguration from "../../config/database.json";
import { GenericRepository } from "../database/GenericRepository";
import { CreateOrganisationCommand } from "../organisation/command/CreateOrganisationCommand";
import { Cryptography } from "../cryptography/Cryptography";
import { CreateAdminUserCommand } from "../user/command/CreateAdminUserCommand";
import { AdminUserFactory } from "../user/AdminUserFactory";
import { CreateGroupCommand } from "../group/command/CreateGroupCommand";
import { ExportAllCommand } from "../member/command/ExportAllCommand";
import { ExternalMemberRepository } from "../member/repository/ExternalMemberRepository";
import Axios from "axios";
import * as pino from "pino";
import { Logger } from "pino";
import { Member } from "../member/Member";

require("dotenv").config();

/**
 * Container for the CLI commands
 */
export class CliContainer {

  public get(command: string): Promise<CliCommand> {
    switch (command) {
      case "create-scheme": return this.getCreateScheme();
      case "create-organisation": return this.getCreateOrganisation();
      case "create-group": return this.getCreateGroup();
      case "create-user": return this.getCreateUser();
      case "export-all-members": return this.getExportAll();
      default: throw command + " not found.";
    }
  }

  public async shutdown(): Promise<void> {
    const db = await this.getDatabase();

    return db.end();
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

  private async getCreateScheme(): Promise<CreateSchemeCommand> {
    const db = await this.getDatabase();

    return new CreateSchemeCommand(
      new GenericRepository(db, "scheme")
    );
  }

  private async getCreateOrganisation(): Promise<CreateOrganisationCommand> {
    const db = await this.getDatabase();

    return new CreateOrganisationCommand(
      new GenericRepository(db, "organisation")
    );
  }

  private async getCreateGroup(): Promise<CreateGroupCommand> {
    const db = await this.getDatabase();

    return new CreateGroupCommand(
        new GenericRepository(db, "member_group")
    );
  }

  private async getCreateUser(): Promise<CreateAdminUserCommand> {
    const db = await this.getDatabase();

    return new CreateAdminUserCommand(
      new AdminUserFactory(new Cryptography()),
      new GenericRepository(db, "admin_user")
    );
  }

  private async getExportAll(): Promise<ExportAllCommand> {
    const db = await this.getDatabase();
    const repository = new GenericRepository<Member>(db, "member");
    const http = Axios.create({
      baseURL: process.env.EXTERNAL_MEMBER_API_URL,
      headers: {
        "Username": process.env.EXTERNAL_MEMBER_API_USERNAME,
        "Password": process.env.EXTERNAL_MEMBER_API_PASSWORD,
        "Api-key": process.env.EXTERNAL_MEMBER_API_KEY
      }
    });
    const api = new ExternalMemberRepository(http, db, this.getLogger());

    return new ExportAllCommand(repository, api);
  }

  @memoize
  private getLogger(): Logger {
    return pino({ prettyPrint: { timeTransOnly: true } });
  }
}
