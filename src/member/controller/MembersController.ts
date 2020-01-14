import { GenericRepository } from "../../database/GenericRepository";
import { Member, MemberJsonView } from "../Member";
import { MemberViewFactory } from "../MemberViewFactory";
import { HttpResponse } from "../../service/controller/HttpResponse";
import { MemberModelFactory } from "../MemberModelFactory";
import autobind from "autobind-decorator";
import { ExternalMemberRepository } from "../repository/ExternalMemberRepository";

/**
 * Controller for bulk creation of members and the get request
 */
@autobind
export class MembersController {

  constructor(
    private readonly repository: GenericRepository<Member>,
    private readonly viewFactory: MemberViewFactory,
    private readonly modelFactory: MemberModelFactory,
    private readonly externalRepository: ExternalMemberRepository
  ) { }

  /**
   * Create multiple new members in a single request
   */
  public async post(request: MembersPostRequest): Promise<MembersPostResponse> {
    const member = this.modelFactory.createFromPartial(request);
    const members = new Array(request.quantity).fill(member);
    const membersWithId = await this.repository.insertAll(members);

    const [view] = await Promise.all([
      this.viewFactory.create(),
      this.externalRepository.exportAll(membersWithId)
    ]);

    const links = {};
    const data = membersWithId.map(m => view.create(links, m));

    return { data, links, code: 201 };
  }

}

export interface MembersPostRequest {
  group: string,
  defaultTransportMode: string,
  defaultDistance: number,
  quantity: number
}

export type MembersPostResponse = HttpResponse<MemberJsonView[]>;
