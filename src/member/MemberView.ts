import { View } from "../service/controller/ReadController";
import { fromMemberId, Member, MemberJsonView } from "./Member";
import { fromGroupId, Group } from "../group/Group";
import { NonNullId } from "../database/GenericRepository";
import { GroupView } from "../group/GroupView";
import { fromTrophyId, Trophy } from "../trophy/Trophy";
import { TrophyView } from "../trophy/TrophyView";

/**
 * Creates group view models
 */
export class MemberView implements View<Member, MemberJsonView> {

  constructor(
    private readonly groups: GroupIndex,
    private readonly trophies: TrophyIndex,
    private readonly groupView: GroupView,
    private readonly trophyView: TrophyView
  ) { }

  /**
   * Return the member JsonView and add the group to the links
   */
  public create(links: object, member: NonNullId<Member>): MemberJsonView {
    const groupId = fromGroupId(member.member_group_id);

    links[groupId] = links[groupId] || this.groupView.create(links, this.groups[member.member_group_id]);

    const memberTrophies = this.trophies[member.id] || [];

    for (const trophy of memberTrophies) {
      links[fromTrophyId(trophy.id)] = this.trophyView.create(links, trophy);
    }

    return {
      id: fromMemberId(member.smartcard || member.id),
      group: groupId,
      rewards: member.rewards,
      carbonSaving: member.carbon_saving,
      defaultDistance: member.default_distance,
      defaultTransportMode: member.default_transport_mode,
      totalMiles: member.total_miles,
      previousTransportMode: member.previous_transport_mode || "",
      trophies: memberTrophies.map(trophy => fromTrophyId(trophy.id))
    };
  }

}

export type GroupIndex = Record<number, NonNullId<Group>>;
export type TrophyIndex = Record<number, NonNullId<Trophy>[]>;
