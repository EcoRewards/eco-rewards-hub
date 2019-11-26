import { View } from "../service/controller/GenericGetController";
import { fromOrganisationId, Organisation, OrganisationJsonView } from "./Organisation";
import { fromSchemeId, Scheme } from "../scheme/Scheme";
import { NonNullId } from "../database/GenericRepository";

/**
 * Creates organisation view models
 */
export class OrganisationView implements View<Organisation, OrganisationJsonView> {

  constructor(
    private readonly schemes: SchemeIndex
  ) { }

  /**
   * Return the organisation ViewModel and add the scheme to the links
   */
  public create(links: object, organisation: NonNullId<Organisation>): OrganisationJsonView {
    const schemeId = fromSchemeId(organisation.scheme_id);

    links[schemeId] = links[schemeId] || this.schemes[organisation.scheme_id];

    return {
      id: fromOrganisationId(organisation.id),
      name: organisation.name,
      scheme: schemeId
    };
  }

}

export type SchemeIndex = Record<number, Scheme>;
