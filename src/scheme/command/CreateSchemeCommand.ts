import { Scheme } from "../Scheme";
import { GenericRepository } from "../../database/GenericRepository";
import { SchemeModelFactory } from "../SchemeModelFactory";

/**
 * Command to create a Scheme and save it in the database
 */
export class CreateSchemeCommand {

  constructor(
    private readonly repository: GenericRepository<Scheme>
  ) {}

  /**
   * Create and save the new scheme
   */
  public async run(name: string): Promise<Scheme> {
    if (name.length < 3) {
      throw Error("Scheme name must be at least 3 characters long");
    }

    return this.repository.save({ id: null, name });
  }

}
