import { CliCommand } from "./CliCommand";
import { CreateSchemeCommand } from "../scheme/command/CreateSchemeCommand";
import * as memoize from "memoized-class-decorator";
import * as databaseConfiguration from "../../config/database.json";
import { SchemeFactory } from "../scheme/SchemeFactory";
import { GenericRepository } from "../database/GenericRepository";
import { OrganisationFactory } from "../organisation/OrganisationFactory";
import { CreateOrganisationCommand } from "../organisation/command/CreateOrganisationCommand";
import { Cryptography } from "../cryptography/Cryptography";

/**
 * Container for the CLI commands
 */
export class CliContainer {

  public get(command: string): Promise<CliCommand> {
    switch (command) {
      case "create-scheme": return this.getCreateScheme();
      case "create-organisation": return this.getCreateOrganisation();
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
      new SchemeFactory(),
      new GenericRepository(db)
    );
  }

  private async getCreateOrganisation(): Promise<CreateOrganisationCommand> {
    const db = await this.getDatabase();

    return new CreateOrganisationCommand(
      new OrganisationFactory(new Cryptography()),
      new GenericRepository(db)
    );
  }

}