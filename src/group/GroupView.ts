import { View } from "../service/controller/GenericGetController";
import { fromGroupId, Group, GroupJsonView } from "./Group";
import { fromOrganisationId, Organisation } from "../organisation/Organisation";
import { NonNullId } from "../database/GenericRepository";

/**
 * Creates organisation view models
 */
export class GroupView implements View<Group, GroupJsonView> {

    constructor(
        private readonly organisations: OrganisationIndex
    ) { }

    /**
     * Return the organisation ViewModel and add the scheme to the links
     */
    public create(links: object, group: NonNullId<Group>): GroupJsonView {
        const organisationId = fromOrganisationId(group.organisation_id);

        links[organisationId] = links[organisationId] || this.organisations[group.organisation_id];

        return {
            id: fromGroupId(group.id),
            name: group.name,
            organisation: organisationId
        };
    }

}

export type OrganisationIndex = Record<number, Organisation>;
