import { View } from "../service/controller/ReadController";
import { Journey, JourneyJsonView } from "./Journey";
import { AdminUserIndex } from "../user/AdminUserRepository";
import { NonNullId } from "../database/GenericRepository";
import { fromMemberId, Member, MemberId } from "../member/Member";

/**
 * Transforms Journey models into JourneyJsonViews
 */
export class JourneyView implements View<Journey, JourneyJsonView> {

  constructor(
    private readonly adminUserIndex: AdminUserIndex,
    private readonly membersById: MembersById
  ) { }

  /**
   * Return the JSON view
   */
  public create(links: object, record: NonNullId<Journey>): JourneyJsonView {
    const member = this.membersById[record.member_id];

    console.log(record.member_id);
    console.log(this.membersById);

    return {
      id: record.id,
      source: this.adminUserIndex[record.admin_user_id].name,
      uploaded: record.uploaded,
      processed: record.processed,
      travelDate: record.travel_date,
      member: fromMemberId(member.smartcard || member.id),
      distance: record.distance,
      mode: record.mode,
      rewardsEarned: record.rewards_earned,
      carbonSaving: record.carbon_saving
    };
  }

}

export type MembersById = Record<MemberId, NonNullId<Member>>;
