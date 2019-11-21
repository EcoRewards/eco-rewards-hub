import { OrganisationFactory } from "../OrganisationFactory";
import { SchemeId } from "../../scheme/Scheme";
import { Organisation } from "../Organisation";
import { GenericRepository } from "../../database/GenericRepository";

/**
 * Command that will create an organisation
 */
export class CreateOrganisationCommand {

  constructor(
    private readonly factory: OrganisationFactory,
    private readonly repository: GenericRepository
  ) {}

  public async run(name: string, schemeId: SchemeId, apiKey: string): Promise<Organisation> {
    // todo better validation library?
    if (name.length < 3) {
      throw "Organisation name must be longer than 2 characters";
    }
    if (apiKey.length !== 86) {
      throw "API key must be exactly 86 characters";
    }

    const organisation = await this.factory.create(name, schemeId, apiKey);

    return await this.repository.save("organisation", organisation);
  }

}