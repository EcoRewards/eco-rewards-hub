import { AxiosInstance } from "axios";
import { fromMemberId, Member, toMemberId } from "../Member";
import { NonNullId } from "../..";
import { Logger } from "pino";

/**
 * Saves members in an external API
 */
export class ExternalMemberRepository {

  constructor(
    private readonly api: AxiosInstance,
    private readonly logger: Logger
  ) { }

  /**
   * Export all members to an external API
   */
  public async exportAll(members: NonNullId<Member>[]): Promise<void> {
    const rows = members.map(m => this.getRow(m));

    try {
      await this.api.post("/api.php", rows);
    }
    catch (e) {
      this.logger.error(e);
    }
  }

  private getRow(member: NonNullId<Member>): Row {
    return {
      "employeeid": fromMemberId(member.smartcard || member.id).substr(8),
      "schema": "0",
      "clientid": member.member_group_id + ""
    };
  }
}

interface Row {
  "employeeid": string,
  "schema": string,
  "clientid": string
}
