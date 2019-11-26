import { GenericRepository } from "../../database/GenericRepository";
import { Group } from "../Group";
import { OrganisationId } from "../../organisation/Organisation";

/**
 * Command that will create an group
 */
export class CreateGroupCommand {

    constructor(
        private readonly repository: GenericRepository<Group>
    ) {}

    public async run(name: string, organisationId: OrganisationId): Promise<Group> {
        if (name.length < 3) {
            throw "Group name must be longer than 2 characters";
        }

        const group = {
            id: null,
            name: name,
            organisation_id: organisationId
        };

        return await this.repository.save(group);
    }

}
