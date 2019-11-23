import { AdminRole, AdminUser } from "./AdminUser";
import { Cryptography } from "../cryptography/Cryptography";

/**
 * Creates admin users
 */
export class AdminUserFactory {

  constructor(
    private readonly crypto: Cryptography
  ) {}

  /**
   * Create an admin user. The password will be hashed for storage.
   */
  public async create(name: string, email: string, password: string, role: AdminRole): Promise<AdminUser> {
    return {
      id: null,
      name: name,
      email: email,
      password: await this.crypto.hash(password),
      role: role
    };
  }

}
