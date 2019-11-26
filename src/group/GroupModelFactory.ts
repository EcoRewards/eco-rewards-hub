import { ModelFactory } from "../service/controller/GenericPostController";
import { Group, GroupJsonView, toGroupId } from "./Group";
import { toOrganisationId } from "../organisation/Organisation";

/**
 * Create a Group model from a GroupJsonView
 */
export class GroupModelFactory implements ModelFactory<GroupJsonView, Group> {

    /**
     * In this case the Model and the JsonView are the same
     */
    public async create(view: GroupJsonView): Promise<Group> {
        return {
            id: view.id ? toGroupId(view.id) : null,
            name: view.name,
            organisation_id: toOrganisationId(view.organisation)
        };
    }

}
