import { AdminUser } from "./AdminUser";
import { Cryptography } from "../cryptography/Cryptography";

/**
 * Creates admin users
 */
export class AdminFactory {

  constructor(
    private readonly crypto: Cryptography
  ) {}

  /**
   * Create an organisation. The apiKey will be hashed for storage.
   */
  public async create(name: string, email: string, password: string): Promise<AdminUser> {
    return {
      id: null,
      name: name,
      email: email,
      password: await this.crypto.hash(password)
    };
  }

}
