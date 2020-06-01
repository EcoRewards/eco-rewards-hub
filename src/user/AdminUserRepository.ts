import { indexBy } from "ts-array-utils";
import { AdminUser } from "./AdminUser";

/**
 * Provides access to the admin user credentials
 */
export class AdminUserRepository {

  constructor(
    private readonly db: any
  ) {}

  /**
   * Create an index of admin user email => password.
   */
  public async getUserIndex(): Promise<AdminUserIndex> {
    const [users]: AdminUser[][] = await this.db.query("SELECT * FROM admin_user");

    return users
      .map(u => ({ ...u, password: u.password.toString() } as AdminUser))
      .reduce(indexBy(r => r.email), {});
  }

}

/**
 * Users indexed by email
 */
export type AdminUserIndex = Record<string, AdminUser>;
