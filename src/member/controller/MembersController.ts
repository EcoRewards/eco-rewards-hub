import { Filter, GenericRepository } from "../../database/GenericRepository";
import { formatIdForCsv, Member, MemberJsonView, toMemberId } from "../Member";
import { MemberViewFactory } from "../MemberViewFactory";
import { HttpResponse } from "../../service/controller/HttpResponse";
import { MemberModelFactory } from "../MemberModelFactory";
import autobind from "autobind-decorator";
import { ExternalMemberRepository } from "../repository/ExternalMemberRepository";
import { GetAllResponse } from "../..";
import { Context } from "koa";
import * as luhn from "luhn-generator";
import { PaginatedRequest, PaginatedResults } from "../../service/controller/ReadController";

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
      this.externalRepository.exportAll(membersWithId, membersWithId[0].member_group_id)
    ]);

    const links = {};
    const data = membersWithId.map(m => view.create(links, m));

    return { data, links, code: 201 };
  }

  /**
   * Return a list of items
   */
  public async getAll(
    { page, quantity, filterText, filterField }: PaginatedRequest, ctx: Context
  ): Promise<GetAllResponse<MemberJsonView> | void> {

    const links = {};
    const filter = filterField && filterText ? ({ text: filterText, field: filterField}) : undefined;

    const [{ rows, pagination }, view] = await Promise.all([
      this.getResults(page, quantity, filter),
      this.viewFactory.create()
    ]);

    const data = rows.map(m => view.create(links, m));
    const accepts = ctx.request.accept.types();

    if (accepts && accepts.includes("text/csv")) {
      const header = "id,scheme,organisation,group,default_distance,default_transport_mode,previous_transport_mode,"
        + "rewards,carbon_saving,total_miles\n";
      const csvData = data.map(m => [
        formatIdForCsv(m.id),
        links[links[links[m.group].organisation].scheme].name,
        links[links[m.group].organisation].name,
        links[m.group].name,
        m.defaultDistance,
        m.defaultTransportMode,
        m.previousTransportMode || "",
        m.rewards,
        m.carbonSaving,
        m.totalMiles
      ].join()).join("\n");

      ctx.set("Content-disposition", "attachment; filename=members.csv");
      ctx.status = 200;
      ctx.body = header + csvData;
    } else {
      return { data, links, pagination };
    }
  }

  private async getResults(page?: string, quantity?: string, filter?: Filter): Promise<PaginatedResults<Member>> {
    if (page && quantity) {
      const filters = filter ? [filter, { field: "id", text: filter.text }] : [];

      return this.repository.selectPaginated(+page, +quantity, filters);
    } else {
      const rows = await this.repository.selectAll();

      return { rows };
    }
  }

  /**
   * Update a number of users
   */
  public async patch({ startId, endId, ...view }: MembersPatchRequest): Promise<HttpResponse<string>> {
    const startMemberId = toMemberId(startId + "");
    const endMemberId = toMemberId(endId + "");
    const model = this.modelFactory.createPartialModel(view);

    await this.repository.updateRange(startMemberId, endMemberId, model);

    const links = {};
    const data = "OK";

    return { data, links, code: 201 };
  }
}

export interface MembersPostRequest {
  group: string,
  defaultTransportMode: string,
  defaultDistance: number,
  quantity: number
}

export interface MembersPatchRequest {
  startId: number | string,
  endId: number | string,
  group: string,
  defaultTransportMode: string,
  defaultDistance: number
}

export type MembersPostResponse = HttpResponse<MemberJsonView[]>;
