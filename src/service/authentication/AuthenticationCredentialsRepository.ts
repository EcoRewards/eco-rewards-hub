import { PasswordIndex } from "./BasicAuthenticationMiddleware";
import { keyValue } from "ts-array-utils";

/**
 * Provides access to the organisation and admin user credentials
 */
export class AuthenticationCredentialsRepository {

  constructor(
    private readonly db: any
  ) {}

  /**
   * Create an index of organisation id => password and admin user email => password.
   */
  public async getPasswordIndex(): Promise<PasswordIndex> {
    const [organisations]: CredentialRow[][] = await this.db.query("SELECT id, api_key FROM organisation");
    const [users]: CredentialRow[][] = await this.db.query("SELECT email as id, password as api_key FROM admin_user");

    return organisations
      .concat(users)
      .reduce(keyValue(row => [row.id, Buffer.from(row.api_key).toString()]), {});
  }

}

/**
 * Row from the database query
 */
export interface CredentialRow {
  id: number | string,
  api_key: Buffer
}
