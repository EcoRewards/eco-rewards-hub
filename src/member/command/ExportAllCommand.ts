import { ExternalMemberRepository, GenericRepository, Member } from "../..";
import { groupBy } from "ts-array-utils";

export class ExportAllCommand {

  constructor(
    private readonly repository: GenericRepository<Member>,
    private readonly api: ExternalMemberRepository
  ) {}

  /**
   * Export all members to VAC media
   */
  public async run(): Promise<void> {
    const members = await this.repository.selectAll();
    const membersByGroup = members.reduce(groupBy(m => m.member_group_id), {});

    for (const [groupId, groupMembers] of Object.entries(membersByGroup)) {
      await this.api.exportAll(groupMembers, +groupId);
    }
  }
}
