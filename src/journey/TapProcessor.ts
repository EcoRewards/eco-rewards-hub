import { Journey } from "./Journey";
import { MemberJourneys } from "./TapReader";
import { JourneyFactory } from "./JourneyFactory";
import { indexBy } from "ts-array-utils";
import { GenericRepository, NonNullId } from "../database/GenericRepository";
import { Member, toMemberId } from "../member/Member";
import { MemberModelFactory } from "../member/MemberModelFactory";
import { ExternalMemberRepository } from "../member/repository/ExternalMemberRepository";
import { AdminUserId } from "../user/AdminUser";
import { Logger } from "pino";

/**
 * Turn tap data into one or more journeys
 */
export class TapProcessor {

  constructor(
    private readonly journeyRepository: GenericRepository<Journey>,
    private readonly memberRepository: GenericRepository<Member>,
    private readonly memberFactory: MemberModelFactory,
    private readonly externalMemberRepository: ExternalMemberRepository,
    private readonly logger: Logger
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
    const results = await Promise.allSettled(
      Object.entries(taps).map(t => journeyFactory.create(t, adminId, deviceId))
    );
    const journeys: Journey[] = [];

    // a LORaWAN uplink is never replayed, so a tap that cannot be turned into a journey is dropped
    // on its own rather than taking the rest of the device's batch with it
    for (const result of results) {
      if (result.status === "fulfilled") {
        journeys.push(result.value);
      } else {
        this.logger.warn(`Discarded tap from device ${deviceId}: ${result.reason?.message}`);
      }
    }

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
