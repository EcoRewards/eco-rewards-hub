import { Journey } from "./Journey";
import { MemberJourneys } from "./TapReader";
import { JourneyFactory } from "./JourneyFactory";
import { indexBy } from "ts-array-utils";
import { GenericRepository, NonNullId } from "../database/GenericRepository";
import { Member, toMemberId } from "../member/Member";
import { MemberModelFactory } from "../member/MemberModelFactory";
import { ExternalMemberRepository } from "../member/repository/ExternalMemberRepository";
import { AdminUserId } from "../user/AdminUser";

/**
 * Turn tap data into one or more journeys
 */
export class TapProcessor {

  constructor(
    private readonly journeyRepository: GenericRepository<Journey>,
    private readonly memberRepository: GenericRepository<Member>,
    private readonly memberFactory: MemberModelFactory,
    private readonly externalMemberRepository: ExternalMemberRepository
  ) {}

  /**
   * Process one or more taps from a device. Any smartcards that do not have a member associated with them will have
   * one created as long as the IIN has a mapping defined.
   */
  public async getJourneys(taps: MemberJourneys, deviceId: string, adminId: AdminUserId): Promise<SavedJourney[]> {
    if (Object.keys(taps).length === 0) {
      return [];
    }

    const journeyFactory = await this.getJourneyFactory(Object.keys(taps));
    const journeyPromises = Object.entries(taps).map(t => journeyFactory.create(t, adminId, deviceId));
    const journeys = await Promise.all(journeyPromises);

    return this.journeyRepository.insertAll(journeys);
  }

  private async getJourneyFactory(memberIds: string[]): Promise<JourneyFactory> {
    const ids = memberIds.map(id => id.length >= 16 ? id : toMemberId(id) + "");
    const members = await this.memberRepository.selectIn(["id", ids], ["smartcard", ids]);
    const membersById = members.reduce(indexBy(m => m.id), {});
    const membersBySmartcard = members.reduce(indexBy(m => m.smartcard || ""), {});

    return new JourneyFactory(
      membersById,
      membersBySmartcard,
      this.memberRepository,
      this.memberFactory,
      this.externalMemberRepository
    );
  }

}

export type SavedJourney = NonNullId<Journey>;
