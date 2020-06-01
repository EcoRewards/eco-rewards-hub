import { JourneyFactory } from "../JourneyFactory";
import { JourneyCsvToMySqlStream } from "./JourneyCsvToMySqlStream";
import { AdminUserId } from "../../user/AdminUser";
import { GenericRepository } from "../../database/GenericRepository";
import { Member } from "../../member/Member";
import { indexBy } from "ts-array-utils";
import { MemberModelFactory } from "../../member/MemberModelFactory";

export class JourneyCsvToMySqlStreamFactory {

  constructor(
    private readonly repository: GenericRepository<Member>
  ) {}

  /**
   * Get an index of members and create a new JourneyFactory for the JourneyCsvToMySqlStream
   */
  public async create(adminUserId: AdminUserId): Promise<JourneyCsvToMySqlStream> {
    const members = await this.repository.getIndexedById();
    const membersBySmartcard = Object.values(members).reduce(indexBy(m => m.smartcard || ""), {});
    const factory = new JourneyFactory(members, membersBySmartcard);

    return new JourneyCsvToMySqlStream(factory, adminUserId);
  }

}
