import { JourneyFactory } from "./JourneyFactory";
import { JourneyCsvToMySqlStream } from "./JourneyCsvToMySqlStream";
import { AdminUserId } from "../user/AdminUser";
import { GenericRepository } from "../database/GenericRepository";
import { Member } from "../member/Member";

export class JourneyCsvToMySqlStreamFactory {

  constructor(
    private readonly repository: GenericRepository<Member>
  ) {}

  /**
   *
   */
  public async create(adminUserId: AdminUserId): Promise<JourneyCsvToMySqlStream> {
    const members = await this.repository.getIndexedById();
    const factory = new JourneyFactory(members);

    return new JourneyCsvToMySqlStream(factory, adminUserId);
  }
}