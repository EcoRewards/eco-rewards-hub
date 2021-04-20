import { Member, MemberId, toMemberId } from "../member/Member";
import { Journey } from "./Journey";
import { AdminUserId } from "../user/AdminUser";
import { NonNullId } from "../database/GenericRepository";

/**
 * Creates journeys by taking in CSV data and overlaying that with member defaults.
 */
export class JourneyFactory {

  constructor(
    private readonly membersById: Record<MemberId, NonNullId<Member>>,
    private readonly membersBySmartcard: Record<string, NonNullId<Member>>
  ) { }

  /**
   * Ensure the member exists, and there is either a default mode and distance or one has been
   * set in the CSV data.
   */
  public create(
    [memberId, date, mode, distance, latitude, longitude]: CsvInput,
    adminUserId: AdminUserId,
    deviceId?: string
  ): Journey {

    const id = memberId.length >= 16 ? memberId : toMemberId(memberId);
    const member = this.membersById[id] || this.membersBySmartcard[id];

    if (!member) {
      throw Error("Cannot find member: " + id);
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
      uploaded: new Date().toISOString().substr(0, 18),
      processed: null,
      travel_date: date,
      member_id: member.id,
      distance: +actualDistance,
      mode: actualMode.toLowerCase(),
      rewards_earned: null,
      carbon_saving: null,
      device_id: deviceId || "",
      latitude: latitude ?? null,
      longitude: longitude ?? null
    };
  }

}

export type CsvInput = [string, string, string?, (string | number)?, number?, number?];
