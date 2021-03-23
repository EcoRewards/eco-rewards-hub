import { Member } from "./Member";
import { toGroupId } from "../group/Group";

/**
 * Create a Member model from a MemberJsonView
 */
export class MemberModelFactory {

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
      default_distance: view.defaultDistance,
      smartcard: view.smartcard || null,
      total_miles: 0,
      previous_transport_mode: view.previousTransportMode || null
    };
  }

  /**
   * Create a member based off the fields that have been provided
   */
  public createPartialModel(view: Partial<PartialMemberJsonView>): Partial<Member> {
    const mapping = {
      group: group => ({ member_group_id: toGroupId(group) }),
      defaultTransportMode: mode => ({ default_transport_mode: mode }),
      defaultDistance: distance => ({ default_distance: distance }),
      previousTransportMode: mode => ({ previous_transport_mode: mode })
    };

    return Object.keys(view).reduce((model, field) => {
      if (typeof mapping[field] === "function") {
        Object.assign(model, mapping[field](view[field]));
      }

      return model;
    }, {});
  }
}

export interface PartialMemberJsonView {
  group: string,
  defaultTransportMode: string,
  previousTransportMode?: string,
  defaultDistance: number,
  smartcard?: string
}
