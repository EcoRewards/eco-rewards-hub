import { JourneyFactory } from "../JourneyFactory";
import { JourneyCsvToMySqlStream } from "./JourneyCsvToMySqlStream";
import { AdminUserId } from "../../user/AdminUser";
import { GenericRepository } from "../../database/GenericRepository";
import { Member } from "../../member/Member";
import { indexBy } from "ts-array-utils";
import { MemberModelFactory } from "../../member/MemberModelFactory";
import { ExternalMemberRepository } from "../../member/repository/ExternalMemberRepository";

export class JourneyCsvToMySqlStreamFactory {

  constructor(
    private readonly repository: GenericRepository<Member>,
    private readonly memberRepository: GenericRepository<Member>,
    private readonly memberFactory: MemberModelFactory,
    private readonly externalMemberRepository: ExternalMemberRepository
  ) {}

  /**
   * Get an index of members and create a new JourneyFactory for the JourneyCsvToMySqlStream
   */
  public async create(adminUserId: AdminUserId): Promise<JourneyCsvToMySqlStream> {
    const members = await this.repository.getIndexedById();
    const membersBySmartcard = Object.values(members).reduce(indexBy(m => m.smartcard || ""), {});
    const factory = new JourneyFactory(
      members,
      membersBySmartcard,
      this.memberRepository,
      this.memberFactory,
      this.externalMemberRepository
    );

    return new JourneyCsvToMySqlStream(factory, adminUserId);
  }

}
