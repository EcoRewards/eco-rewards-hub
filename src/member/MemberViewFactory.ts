import { ViewFactory } from "../service/controller/ReadController";
import { Member, MemberId, MemberJsonView } from "./Member";
import { GenericRepository } from "../database/GenericRepository";
import { MemberView } from "./MemberView";
import { GroupViewFactory } from "../group/GroupViewFactory";
import { Group } from "../group/Group";
import { Trophy } from "../trophy/Trophy";
import { TrophyViewFactory } from "../trophy/TrophyViewFactory";

/**
 * Creates a MemberView
 */
export class MemberViewFactory implements ViewFactory<Member, MemberJsonView> {

  constructor(
    private readonly groupRepository: GenericRepository<Group>,
    private readonly trophyRepository: GenericRepository<Trophy>,
    private readonly groupViewFactory: GroupViewFactory,
    private readonly trophyViewFactory: TrophyViewFactory
  ) { }

  /**
   * Load the group index and the group view factory for the MemberView
   */
  public async create(members: MemberId[]): Promise<MemberView> {
    const [groups, groupView, trophyView, trophies] = await Promise.all([
      this.groupRepository.getIndexedById(),
      this.groupViewFactory.create(),
      this.trophyViewFactory.create(),
      this.trophyRepository.selectIn(["member_id", members])
    ]);

    const trophiesByMember = trophies.reduce((acc, trophy) => {
      acc[trophy.member_id] = acc[trophy.member_id] || [];
      acc[trophy.member_id].push(trophy);

      return acc;
    }, {});

    return new MemberView(groups, trophiesByMember, groupView, trophyView);
  }

}
