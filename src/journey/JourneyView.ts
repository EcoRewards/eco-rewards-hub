import { View } from "../service/controller/ReadController";
import { Journey, JourneyJsonView } from "./Journey";
import { AdminUserIndex } from "../user/AdminUserRepository";
import { NonNullId } from "../database/GenericRepository";
import { formatIdForCsv, fromMemberId } from "../member/Member";
import { JourneyWithGroupOrgAndScheme } from "./repository/JourneyRepository";

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
      source: this.adminUserIndex[record.admin_user_id].name,
      uploaded: record.uploaded,
      processed: record.processed,
      travelDate: record.travel_date,
      memberId: fromMemberId(record.member_id),
      distance: record.distance,
      mode: record.mode,
      rewardsEarned: record.rewards_earned,
      carbonSaving: record.carbon_saving,
      deviceId: record.device_id
    };
  }

  /**
   * Return a CSV view
   */
  public createCsv(links: object, record: JourneyWithGroupOrgAndScheme): Array<string | number | null> {
    return [
      this.adminUserIndex[record.admin_user_id].name,
      record.uploaded,
      record.processed,
      record.travel_date,
      formatIdForCsv(fromMemberId(record.member_id)),
      record.distance,
      record.mode,
      record.rewards_earned,
      record.carbon_saving,
      record.device_id,
      record.group_id,
      record.organisation_id,
      record.scheme_id
    ];
  }

}
