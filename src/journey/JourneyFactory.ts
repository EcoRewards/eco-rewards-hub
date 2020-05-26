import { Member, MemberId, toMemberId } from "../member/Member";
import { Journey } from "./Journey";
import { AdminUserId } from "../user/AdminUser";
import { GenericRepository, NonNullId } from "../database/GenericRepository";
import { MemberModelFactory } from "../member/MemberModelFactory";

/**
 * Creates journeys by taking in CSV data and overlaying that with member defaults.
 */
export class JourneyFactory {

  private static readonly BRACKNELL_RESIDENTS_GROUP = "18";
  private static readonly BRACKNELL_RAIL_GROUP = "10";

  constructor(
    private readonly membersById: Record<MemberId, NonNullId<Member>>,
    private readonly membersBySmartcard: Record<string, NonNullId<Member>>,
    private readonly memberRepository: GenericRepository<Member>,
    private readonly memberFactory: MemberModelFactory,
  ) { }

  /**
   * Ensure the member exists, and there is either a default mode and distance or one has been
   * set in the CSV data.
   */
  public async create(
    [memberId, date, mode, distance]: CsvInput,
    adminUserId: AdminUserId,
    deviceId?: string
  ): Promise<Journey> {

    const id = memberId.length >= 16 ? memberId : toMemberId(memberId);
    const member = await this.getMember(id);

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
      mode: actualMode,
      rewards_earned: null,
      carbon_saving: null,
      device_id: deviceId || ""
    };
  }

  private async getMember(id: string | number): Promise<NonNullId<Member>> {
    if (this.membersById[id]) {
      return this.membersById[id];
    }
    else if (this.membersBySmartcard[id]) {
      return this.membersBySmartcard[id];
    }
    else if (typeof id === "string" && id.substr(0, 8) === "63380000") {
      const member = this.memberFactory.createFromPartial({
        smartcard: id,
        group: JourneyFactory.BRACKNELL_RESIDENTS_GROUP,
        defaultDistance: 1,
        defaultTransportMode: "walk",
        previousTransportMode: "walk"
      });

      return this.memberRepository.save(member);
    }
    else if (typeof id === "string" && id.substr(0, 10) === "6335970109") {
      const member = this.memberFactory.createFromPartial({
        smartcard: id,
        group: JourneyFactory.BRACKNELL_RAIL_GROUP,
        defaultDistance: 1,
        defaultTransportMode: "walk",
        previousTransportMode: "walk"
      });

      return this.memberRepository.save(member);
    }

    throw Error("Cannot find member: " + id);
  }
}

export type CsvInput = [string, string, string?, string?];
