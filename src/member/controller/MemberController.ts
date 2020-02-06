import autobind from "autobind-decorator";
import { GetRequest, GetResponse } from "../../service/controller/ReadController";
import { MemberJsonView, toMemberId, Member } from "../Member";
import { MemberViewFactory } from "../MemberViewFactory";
import { MemberRepository } from "../repository/MemberRepository";
import {
  GenericRepository,
  HttpError,
  HttpResponse,
  MemberModelFactory,
  MemberView,
  NonNullId
} from "../..";
import { ExternalMemberRepository } from "../repository/ExternalMemberRepository";

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
    const [model, view] = await Promise.all<AMember, MemberView>([
      this.getModel(id),
      this.viewFactory.create()
    ]);

    if (!model) {
      return { data: { error: "Not found"}, links, code: 404 };
    }

    const data = view.create(links, model);

    return { data, links };
  }

  private getModel(id: string): Promise<AMember> {
    return id.length >= 16
      ? this.memberRepository.selectBySmartcard(id)
      : this.genericRepository.selectOne(toMemberId(id));
  }

  /**
   * Create multiple new members in a single request
   */
  public async post(request: MemberPostRequest): Promise<MemberResponse> {
    const member = this.modelFactory.createFromPartial(request);
    const memberWithId = await this.genericRepository.save(member);

    const [view] = await Promise.all([
      this.viewFactory.create(),
      this.externalRepository.exportAll([memberWithId], memberWithId.member_group_id)
    ]);

    const links = {};
    const data = view.create(links, memberWithId);

    return { data, links, code: 201 };
  }

  /**
   * Update a Member
   */
  public async put(request: MemberPutRequest): Promise<PutResponse> {
    const links = {};
    const member = await this.getModel(request.id);

    if (!member) {
      return { data: { error: "Not found" }, links, code: 404 };
    }
    member.default_transport_mode = request.defaultTransportMode;
    member.default_distance = request.defaultDistance;

    const savedModel = await this.genericRepository.save(member);

    const view = await this.viewFactory.create();
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
  defaultDistance: number,
  smartcard: string
}

export interface MemberPutRequest {
  id: string,
  defaultTransportMode: string,
  defaultDistance: number
}
