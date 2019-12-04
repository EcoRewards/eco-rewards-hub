import { ModelFactory } from "../service/controller/WriteController";
import { Member, MemberJsonView, toMemberId } from "./Member";
import { toGroupId } from "../group/Group";

/**
 * Create a Member model from a MemberJsonView
 */
export class MemberModelFactory implements ModelFactory<MemberJsonView, Member> {

  /**
   * In this case the Model and the JsonView are the same
   */
  public async create(view: MemberJsonView): Promise<Member> {
    return {
      id: toMemberId(view.id),
      member_group_id: toGroupId(view.group),
      rewards: view.rewards,
      carbon_saving: view.carbonSaving,
      default_transport_mode: view.defaultTransportMode,
      default_distance: view.defaultDistance
    };
  }

  /**
   * Create a new member with the default values for reward and carbon saving
   */
  public createFromPartial(view: PartialMemberJsonView): Member {
    return {
      id: null,
      member_group_id: toGroupId(view.group),
      rewards: 0,
      carbon_saving: 0,
      default_transport_mode: view.defaultTransportMode,
      default_distance: view.defaultDistance
    };
  }

}

export interface PartialMemberJsonView {
  group: string,
  defaultTransportMode: string,
  defaultDistance: number
}
