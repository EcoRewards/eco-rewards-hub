import { AdminUserFactory } from "../AdminUserFactory";
import { AdminRole, AdminUser } from "../AdminUser";
import { GenericRepository } from "../../database/GenericRepository";

/**
 * Command that will create an admin user
 */
export class CreateAdminUserCommand {

  constructor(
    private readonly factory: AdminUserFactory,
    private readonly repository: GenericRepository<AdminUser>
  ) {}

  public async run(name: string, email: string, password: string, role: AdminRole): Promise<AdminUser> {
    if (name.length < 3) {
      throw "User name must be longer than 2 characters";
    }
    if (email.length < 10 || !email.includes(".") || !email.includes("@")) {
      throw "Invalid email";
    }
    if (password.length < 5) {
      throw "Password must be exactly 86 characters";
    }

    const user = await this.factory.create(name, email, password, role);

    return await this.repository.save(user);
  }

}
