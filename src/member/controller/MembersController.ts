import { GenericRepository, NonNullId } from "../../database/GenericRepository";
import { Member, MemberJsonView } from "../Member";
import { MemberViewFactory } from "../MemberViewFactory";
import { HttpResponse } from "../../service/controller/HttpResponse";
import { MemberModelFactory } from "../MemberModelFactory";
import autobind from "autobind-decorator";
import { ExternalMemberRepository } from "../repository/ExternalMemberRepository";
import { GetAllResponse, View } from "../..";
import { Context } from "koa";

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

  /**
   * Return a list of items
   */
  public async getAll(request: {}, ctx: Context): Promise<GetAllResponse<MemberJsonView> | void> {
    const links = {};
    const [models, view] = await Promise.all([
      this.repository.selectAll(),
      this.viewFactory.create()
    ]);

    const data = models.map(m => view.create(links, m));
    const accepts = ctx.request.accept.types();

    if (accepts && accepts.includes("text/csv")) {
      ctx.set("Content-disposition", "attachment; filename=members.csv");
      ctx.status = 200;
      ctx.body = data.map(m => [
        m.id.substr(m.id.lastIndexOf("/") + 1),
        m.group.substr(m.group.lastIndexOf("/") + 1),
        m.defaultDistance,
        m.defaultTransportMode,
        m.rewards,
        m.carbonSaving,
        m.totalMiles
      ].join()).join("\n");
    } else {
      return { data, links };
    }
  }

}

export interface MembersPostRequest {
  group: string,
  defaultTransportMode: string,
  defaultDistance: number,
  quantity: number
}

export type MembersPostResponse = HttpResponse<MemberJsonView[]>;
