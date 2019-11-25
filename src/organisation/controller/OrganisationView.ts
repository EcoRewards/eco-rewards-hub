import { View } from "../../service/controller/GenericController";
import { Organisation, OrganisationJsonView } from "../Organisation";
import { Scheme } from "../../scheme/Scheme";
import { NonNullId } from "../../database/GenericRepository";

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
    const schemeId = "/scheme/" + organisation.scheme_id;

    links[schemeId] = links[schemeId] || this.schemes[organisation.scheme_id];

    return {
      id: organisation.id,
      name: organisation.name,
      scheme: schemeId
    };
  }

}

export type SchemeIndex = Record<number, Scheme>;
