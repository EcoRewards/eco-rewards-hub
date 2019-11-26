import { ModelFactory } from "../service/controller/GenericPostController";
import { Organisation, OrganisationJsonView, toOrganisationId } from "./Organisation";
import { toSchemeId } from "../scheme/Scheme";

/**
 * Create a Organisation model from a OrganisationJsonView
 */
export class OrganisationModelFactory implements ModelFactory<OrganisationJsonView, Organisation> {

  /**
   * In this case the Model and the JsonView are the same
   */
  public async create(view: OrganisationJsonView): Promise<Organisation> {
    return {
      id: view.id ? toOrganisationId(view.id) : null,
      name: view.name,
      scheme_id: toSchemeId(view.scheme)
    };
  }

}
