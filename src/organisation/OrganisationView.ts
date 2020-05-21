import { View } from "../service/controller/ReadController";
import { fromOrganisationId, Organisation, OrganisationJsonView } from "./Organisation";
import { fromSchemeId, Scheme } from "../scheme/Scheme";
import { NonNullId } from "../database/GenericRepository";
import { SchemeView } from "../scheme/SchemeView";

/**
 * Creates organisation view models
 */
export class OrganisationView implements View<Organisation, OrganisationJsonView> {

  constructor(
    private readonly schemes: SchemeIndex,
    private readonly schemeView: SchemeView
  ) { }

  /**
   * Return the organisation ViewModel and add the scheme to the links
   */
  public create(links: object, organisation: NonNullId<Organisation>): OrganisationJsonView {
    const schemeId = fromSchemeId(organisation.scheme_id);

    links[schemeId] = links[schemeId] || this.schemeView.create(links, this.schemes[organisation.scheme_id]);

    return {
      id: fromOrganisationId(organisation.id),
      name: organisation.name,
      scheme: schemeId
    };
  }

}

export type SchemeIndex = Record<number, NonNullId<Scheme>>;
