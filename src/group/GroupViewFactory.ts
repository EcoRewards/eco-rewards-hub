import { ViewFactory } from "../service/controller/GenericGetController";
import { Group, GroupJsonView } from "./Group";
import { GenericRepository } from "../database/GenericRepository";
import { Organisation } from "../organisation/Organisation";
import { GroupView } from "./GroupView";

/**
 * Creates an GroupViewFactory
 */
export class GroupViewFactory implements ViewFactory<Group, GroupJsonView> {

    constructor(
        private readonly repository: GenericRepository<Organisation>
    ) { }

    public async create(): Promise<GroupView> {
        return new GroupView(
            await this.repository.getIndexedById()
        );
    }

}
