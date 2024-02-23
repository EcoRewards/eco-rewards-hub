import { SchemeId } from "../../scheme/Scheme";
import { Organisation } from "../Organisation";
import { GenericRepository } from "../../database/GenericRepository";

/**
 * Command that will create an organisation
 */
export class CreateOrganisationCommand {

  constructor(
    private readonly repository: GenericRepository<Organisation>
  ) {}

  public async run(name: string, schemeId: SchemeId): Promise<Organisation> {
    if (name.length < 3) {
      throw "Organisation name must be longer than 2 characters";
    }

    const organisation = {
      id: null,
      name: name,
      scheme_id: schemeId
    };

    return this.repository.save(organisation);
  }

}
