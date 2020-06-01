import { Context } from "koa";
import { Journey } from "./Journey";
import { TapReader, toHex } from "./TapReader";
import { JourneyFactory } from "./JourneyFactory";
import { indexBy } from "ts-array-utils";
import { GenericRepository, NonNullId } from "../database/GenericRepository";
import { Member } from "../member/Member";
import { MemberModelFactory } from "../member/MemberModelFactory";
import { ExternalMemberRepository } from "../member/repository/ExternalMemberRepository";

/**
 * Turn tap data into one or more journeys
 */
export class TapProcessor {
  private static readonly memberGroup = {
    "63380000": "18",
    "63359701": "10"
  };

  constructor(
    private readonly tapReader: TapReader,
    private readonly journeyRepository: GenericRepository<Journey>,
    private readonly memberRepository: GenericRepository<Member>,
    private readonly memberFactory: MemberModelFactory,
    private readonly externalMemberRepository: ExternalMemberRepository
  ) {}

  /**
   * Process one or more taps from a device. Any smartcards that do not have a member associated with them will have
   * one created as long as the IIN has a mapping defined.
   */
  public async getJourneys(buffer: Buffer, ctx: Context): Promise<NonNullId<Journey>[]> {
    const deviceId = Array.from(buffer).slice(0, 4).map(toHex).join("");
    const taps = Object.entries(this.tapReader.getTaps(buffer));
    const journeyFactory = await this.getJourneyFactory(taps);
    const journeys = taps.map(t => journeyFactory.create(t, ctx.adminUserId, deviceId));

    return this.journeyRepository.insertAll(journeys);
  }

  private async getJourneyFactory(taps: [string, string][]): Promise<JourneyFactory> {
    const members = await this.memberRepository.getIndexedById();
    const membersBySmartcard = Object.values(members).reduce(indexBy(m => m.smartcard || ""), {});

    for (const [memberId] of taps) {
      // if it was a smartcard check to see if the account needs to be created
      if (memberId.length >= 16 && !members[memberId] && !membersBySmartcard[memberId]) {
        const member = await this.createMember(memberId);

        if (member) {
          membersBySmartcard[memberId] = member;
        }
      }
    }

    return new JourneyFactory(members, membersBySmartcard);
  }

  private async createMember(id: string): Promise<undefined | NonNullId<Member>> {
    const group = TapProcessor.memberGroup[id.substr(0, 8)];

    if (!group) {
      return undefined;
    }

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