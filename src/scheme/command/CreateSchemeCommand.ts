import { Scheme } from "../Scheme";
import { SchemeFactory } from "../SchemeFactory";
import { GenericRepository } from "../../database/GenericRepository";

/**
 * Command to create a Scheme and save it in the database
 */
export class CreateSchemeCommand {

  constructor(
    private readonly factory: SchemeFactory,
    private readonly repository: GenericRepository
  ) {}

  /**
   * Create and save the new scheme
   */
  public async run(name: string): Promise<Scheme> {
    const scheme = this.factory.create(name);

    return this.repository.save("scheme", scheme);
  }

}