import { View } from "../service/controller/ReadController";
import { fromMemberId, Member, MemberJsonView } from "./Member";
import { fromGroupId, Group } from "../group/Group";
import { NonNullId } from "../database/GenericRepository";
import { GroupView } from "../group/GroupView";

/**
 * Creates group view models
 */
export class MemberView implements View<Member, MemberJsonView> {

  constructor(
    private readonly groups: GroupIndex,
    private readonly groupView: GroupView
  ) { }

  /**
   * Return the member JsonView and add the group to the links
   */
  public create(links: object, member: NonNullId<Member>): MemberJsonView {
    const groupId = fromGroupId(member.member_group_id);

    links[groupId] = links[groupId] || this.groupView.create(links, this.groups[member.member_group_id]);

    return {
      id: fromMemberId(member.smartcard || member.id),
      group: groupId,
      rewards: member.rewards,
      carbonSaving: member.carbon_saving,
      defaultDistance: member.default_distance,
      defaultTransportMode: member.default_transport_mode
    };
  }

}

export type GroupIndex = Record<number, NonNullId<Group>>;
