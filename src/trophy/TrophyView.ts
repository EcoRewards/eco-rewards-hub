import { View } from "../service/controller/ReadController";
import { NonNullId } from "../database/GenericRepository";
import { fromTrophyId, Trophy, TrophyJsonView } from "./Trophy";
import { fromGroupId } from "../group/Group";
import { fromMemberId } from "../member/Member";

/**
 * Transforms Location models into LocationJsonViews
 */
export class TrophyView implements View<Trophy, TrophyJsonView> {

  /**
   * Return the JSON view
   */
  public create(links: object, record: NonNullId<Trophy>): TrophyJsonView {
    return {
      id: fromTrophyId(record.id),
      name: record.name,
      member: fromMemberId(record.member_id),
      dateAwarded: record.date_awarded.toISOString(),
      memberGroup: fromGroupId(record.member_group_id),
      rewards: record.rewards,
      carbonSaving: record.carbon_saving,
      miles: record.miles
    };
  }

}