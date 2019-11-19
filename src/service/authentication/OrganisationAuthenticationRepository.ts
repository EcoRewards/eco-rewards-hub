import { PasswordIndex } from "./BasicAuthenticationMiddleware";
import { keyValue } from "ts-array-utils";

export class OrganisationAuthenticationRepository {

  constructor(
    private readonly db: any
  ) {}

  public async getPasswordIndex(): Promise<PasswordIndex> {
    const [rows]: CredentialRow[][] = await this.db.query("SELECT id, api_key FROM organisation");

    return rows.reduce(keyValue(row => [row.id, Buffer.from(row.api_key).toString()]), {});
  }
}

interface CredentialRow {
  id: number,
  api_key: Buffer
}
