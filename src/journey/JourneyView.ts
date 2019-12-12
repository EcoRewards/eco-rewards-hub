import { View } from "../service/controller/ReadController";
import { Journey, JourneyJsonView } from "./Journey";
import { AdminUserIndex } from "../user/AdminUserRepository";
import { NonNullId } from "../database/GenericRepository";
import { fromMemberId } from "../member/Member";

/**
 * Transforms Journey models into JourneyJsonViews
 */
export class JourneyView implements View<Journey, JourneyJsonView> {

  constructor(
    private readonly adminUserIndex: AdminUserIndex
  ) { }

  /**
   * Return the JSON view
   */
  public create(links: object, record: NonNullId<Journey>): JourneyJsonView {
    return {
      id: record.id,
      source: this.adminUserIndex[record.admin_user_id].name,
      uploaded: record.uploaded,
      processed: record.processed,
      travelDate: record.travel_date,
      memberId: fromMemberId(record.member_id),
      distance: record.distance,
      mode: record.mode,
      rewardsEarned: record.rewards_earned,
      carbonSaving: record.carbon_saving
    };
  }

}
