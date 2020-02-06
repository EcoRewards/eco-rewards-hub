import { AxiosInstance } from "axios";
import { fromMemberId, Member } from "../Member";
import { NonNullId } from "../../database/GenericRepository";
import { Logger } from "pino";
import { GroupId } from "../../group/Group";

/**
 * Saves members in an external API
 */
export class ExternalMemberRepository {

  constructor(
    private readonly api: AxiosInstance,
    private readonly db: any,
    private readonly logger: Logger
  ) { }

  /**
   * Export all members to an external API
   */
  public async exportAll(members: NonNullId<Member>[], groupId: GroupId): Promise<void> {
    const clientId = await this.getGroupVacClientId(groupId);
    const rows = members.map(m => this.getRow(m, clientId));

    try {
      await this.api.post("/api.php", rows);
    }
    catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Select the vac_client_id of the given group
   */
  private async getGroupVacClientId(groupId: GroupId): Promise<number> {
    const [[row]] = await this.db.query(
      `SELECT vac_client_id 
       FROM member_group 
       JOIN organisation ON member_group.organisation_id = organisation.id
       JOIN scheme ON organisation.scheme_id = scheme.id 
       WHERE member_group.id = ?
       LIMIT 1`,
      [groupId]
    );

    return row ? row.vac_client_id : 0;
  }

  private getRow(member: NonNullId<Member>, clientId: number): Row {
    return {
      "employeeid": fromMemberId(member.smartcard || member.id).substr(8),
      "schema": "0",
      "clientid": clientId + ""
    };
  }

}

interface Row {
  "employeeid": string,
  "schema": string,
  "clientid": string
}
