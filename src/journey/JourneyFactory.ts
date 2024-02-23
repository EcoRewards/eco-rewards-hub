import { Member, MemberId, toMemberId } from "../member/Member";
import { Journey, JourneyType } from "./Journey";
import { AdminUserId } from "../user/AdminUser";
import { GenericRepository, NonNullId } from "../database/GenericRepository";
import { MemberModelFactory } from "../member/MemberModelFactory";
import { ExternalMemberRepository } from "../member/repository/ExternalMemberRepository";

/**
 * Creates journeys by taking in CSV data and overlaying that with member defaults.
 */
export class JourneyFactory {
  private static readonly memberGroup = {
    "63380000": "18",
    "63359702": "18",
    "63359701": "10",
    "01570112": "121"
  };

  constructor(
    private readonly membersById: Record<MemberId, NonNullId<Member>>,
    private readonly membersBySmartcard: Record<string, NonNullId<Member>>,
    private readonly memberRepository: GenericRepository<Member>,
    private readonly memberFactory: MemberModelFactory,
    private readonly externalMemberRepository: ExternalMemberRepository
  ) { }

  /**
   * Ensure the member exists, and there is either a default mode and distance or one has been
   * set in the CSV data.
   */
  public async create(
    [memberId, date, mode, distance, latitude, longitude, csvDeviceId, journeyType]: CsvInput,
    adminUserId: AdminUserId,
    deviceId?: string
  ): Promise<Journey> {

    const id = memberId.length >= 16 ? memberId : toMemberId(memberId) + "";
    let member = this.membersById[id] || this.membersBySmartcard[id];

    if (!member) {
      // if it was a smartcard check to see if the account needs to be created
      if (memberId.length >= 16 && JourneyFactory.memberGroup[id.substr(0, 8)]) {
        member = await this.createMember(memberId, JourneyFactory.memberGroup[id.substr(0, 8)]);
      } else {
        throw Error("Cannot find member: " + id);
      }
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
      device_id: deviceId || csvDeviceId || "",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      type: journeyType || "journey"
    };
  }

  private async createMember(id: string, group: string): Promise<NonNullId<Member>> {
    const member = this.memberFactory.createFromPartial({
      smartcard: id,
      group: group,
      defaultDistance: 1,
      defaultTransportMode: "walk",
      previousTransportMode: "walk"
    });

    const savedMember = await this.memberRepository.save(member);
    await this.externalMemberRepository.exportAll([savedMember], savedMember.member_group_id);

    return savedMember;
  }

}

export type CsvInput = [string, string, string?, (string | number)?, number?, number?, string?, JourneyType?];
