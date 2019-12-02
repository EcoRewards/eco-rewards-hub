import { View } from "../service/controller/GenericGetController";
import { fromGroupId, Group, GroupJsonView } from "./Group";
import { fromOrganisationId, Organisation } from "../organisation/Organisation";
import { NonNullId } from "../database/GenericRepository";
import { OrganisationView } from "../organisation/OrganisationView";

/**
 * Creates group view models
 */
export class GroupView implements View<Group, GroupJsonView> {

  constructor(
    private readonly organisations: OrganisationIndex,
    private readonly organisationView: OrganisationView
  ) { }

  /**
   * Return the group ViewModel and add the scheme to the links
   */
  public create(links: object, group: NonNullId<Group>): GroupJsonView {
    const orgId = fromOrganisationId(group.organisation_id);

    links[orgId] = links[orgId] || this.organisationView.create(links, this.organisations[group.organisation_id]);

    return {
      id: fromGroupId(group.id),
      name: group.name,
      organisation: orgId
    };
  }

}

export type OrganisationIndex = Record<number, NonNullId<Organisation>>;
