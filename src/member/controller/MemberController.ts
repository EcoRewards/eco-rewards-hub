import autobind from "autobind-decorator";
import { GetRequest, GetResponse } from "../../service/controller/ReadController";
import { Member, MemberJsonView, toMemberId } from "../Member";
import { MemberViewFactory } from "../MemberViewFactory";
import { MemberRepository } from "../repository/MemberRepository";
import { GenericRepository, HttpError, HttpResponse, MemberModelFactory, NonNullId, toGroupId } from "../..";
import { ExternalMemberRepository } from "../repository/ExternalMemberRepository";
import { Context } from "koa";

/**
 * Controller for /member
 */
@autobind
export class MemberController {

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly genericRepository: GenericRepository<Member>,
    private readonly viewFactory: MemberViewFactory,
    private readonly modelFactory: MemberModelFactory,
    private readonly externalRepository: ExternalMemberRepository
  ) { }

  /**
   * Return a member using either their ID or smartcard number
   */
  public async get({ id }: GetRequest): Promise<GetResponse<MemberJsonView>> {
    const links = {};
    const model = await this.getModel(id);

    if (!model) {
      return { data: { error: "Not found" }, links, code: 404 };
    }

    const view = await this.viewFactory.create([model.id]);
    const data = view.create(links, model);

    return { data, links };
  }

  private getModel(id: string): Promise<AMember> {
    return id.length >= 16
      ? this.memberRepository.selectBySmartcard(id)
      : this.genericRepository.selectOne(toMemberId(id));
  }

  /**
   * Create a new member
   */
  public async post(request: MemberPostRequest): Promise<MemberResponse> {
    const member = this.modelFactory.createFromPartial(request);
    const memberWithId = await this.genericRepository.save(member);

    const [view] = await Promise.all([
      this.viewFactory.create([]),
      this.externalRepository.exportAll([memberWithId], memberWithId.member_group_id)
    ]);

    const links = {};
    const data = view.create(links, memberWithId);

    return { data, links, code: 201 };
  }

  /**
   * Update a Member
   */
  public async update(request: MemberPutRequest, ctx: Context): Promise<PutResponse> {
    const links = {};
    const member = await this.getModel(request.id);

    if (!member) {
      return { data: { error: "Not found" }, links, code: 404 };
    }

    member.member_group_id = request.group ? toGroupId(request.group) : member.member_group_id;
    member.default_transport_mode = request.defaultTransportMode ?? member.default_transport_mode;
    member.previous_transport_mode = request.previousTransportMode ?? member.previous_transport_mode;
    member.default_distance = request.defaultDistance ?? member.default_distance;

    if (ctx.method === "PUT") {
      member.carbon_saving = request.carbonSaving ?? member.carbon_saving;
      member.rewards = request.rewards ?? member.rewards;
      member.total_miles = request.totalMiles ?? member.total_miles;
    }

    const savedModel = await this.genericRepository.save(member);
    const view = await this.viewFactory.create([member.id]);
    const data = view.create(links, savedModel);

    return { data, links, code: 200 };
  }

}

type AMember = NonNullId<Member> | undefined;

export type MemberResponse = HttpResponse<MemberJsonView>;
export type PutResponse = HttpResponse<MemberJsonView | HttpError>;

export interface MemberPostRequest {
  group: string,
  defaultTransportMode: string,
  previousTransportMode?: string,
  defaultDistance: number,
  smartcard: string
}

export interface MemberPutRequest {
  id: string,
  group?: string,
  defaultTransportMode?: string,
  previousTransportMode?: string,
  defaultDistance?: number
  carbonSaving?: number
  rewards?: number
  totalMiles?: number
}
