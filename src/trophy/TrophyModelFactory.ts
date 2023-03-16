import { ModelFactory } from "../service/controller/WriteController";
import { Trophy, TrophyJsonView, toTrophyId } from "./Trophy";
import { toMemberId } from "../member/Member";
import { toGroupId } from "../group/Group";

/**
 * Create a Trophy model from a TrophyJsonView
 */
export class TrophyModelFactory implements ModelFactory<TrophyJsonView, Trophy> {

  /**
   * In this case the Model and the JsonView are the same
   */
  public async create(view: TrophyJsonView): Promise<Trophy> {
    return {
      id: view.id ? toTrophyId(view.id) : null,
      name: view.name,
      member_id: toMemberId(view.member),
      date_awarded: new Date(view.dateAwarded),
      member_group_id: toGroupId(view.memberGroup),
      rewards: view.rewards,
      carbon_saving: view.carbonSaving,
      miles: view.miles
    };
  }

}
