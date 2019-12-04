import { ViewFactory } from "../service/controller/ReadController";
import { Member, MemberJsonView } from "./Member";
import { GenericRepository } from "../database/GenericRepository";
import { MemberView } from "./MemberView";
import { GroupViewFactory } from "../group/GroupViewFactory";
import { Group } from "../group/Group";

/**
 * Creates a MemberView
 */
export class MemberViewFactory implements ViewFactory<Member, MemberJsonView> {

  constructor(
    private readonly repository: GenericRepository<Group>,
    private readonly groupViewFactory: GroupViewFactory
  ) { }

  /**
   * Load the group index and the group view factory for the MemberView
   */
  public async create(): Promise<MemberView> {
    const [groups, groupView] = await Promise.all([
      this.repository.getIndexedById(),
      this.groupViewFactory.create()
    ]);

    return new MemberView(groups, groupView);
  }

}
