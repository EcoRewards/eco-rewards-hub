import { Member, MemberId, toMemberId } from "../member/Member";
import { Journey } from "./Journey";
import { AdminUserId } from "../user/AdminUser";

/**
 * Creates journeys by taking in CSV data and overlaying that with member defaults.
 */
export class JourneyFactory {

  constructor(
    private readonly members: Record<MemberId, Member>
  ) { }

  /**
   * Ensure the member exists, and there is either a default mode and distance or one has been
   * set in the CSV data.
   */
  public create([memberId, date, mode, distance]: CsvInput, adminUserId: AdminUserId): Journey {
    const actualMemberId = toMemberId(memberId);
    const member = this.members[actualMemberId];

    if (!member) {
      throw Error("Cannot find member: " + memberId);
    }

    const actualMode = mode || member.default_transport_mode;

    if (!actualMode) {
      throw Error(`No mode given for ${memberId} and no default set`);
    }

    const actualDistance = distance || member.default_distance;

    if (!actualDistance) {
      throw Error(`No distance given for ${memberId} and no default set`);
    }

    return {
      id: null,
      admin_user_id: adminUserId,
      uploaded: new Date().toISOString(),
      processed: null,
      travel_date: date,
      member_id: actualMemberId,
      distance: +actualDistance,
      mode: actualMode,
      rewards_earned: null,
      carbon_saving: null,
    };
  }

}

export type CsvInput = [string, string, string?, string?];
