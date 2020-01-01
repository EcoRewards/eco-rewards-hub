import autobind from "autobind-decorator";
import { GetRequest, GetResponse } from "../../service/controller/ReadController";
import { MemberJsonView, toMemberId, Member } from "../Member";
import { MemberViewFactory } from "../MemberViewFactory";
import { MemberRepository } from "../repository/MemberRepository";
import {
  GenericRepository, HttpResponse,
  MemberModelFactory,
  MembersPostRequest,
  MembersPostResponse,
  MemberView,
  NonNullId
} from "../..";

/**
 * Controller for /member
 */
@autobind
export class MemberController {

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly genericRepository: GenericRepository<Member>,
    private readonly viewFactory: MemberViewFactory,
    private readonly modelFactory: MemberModelFactory
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
    return id.length === 18
      ? this.memberRepository.selectBySmartcard(id)
      : this.genericRepository.selectOne(toMemberId(id));
  }

  /**
   * Create multiple new members in a single request
   */
  public async post(request: MemberPostRequest): Promise<MemberPostResponse> {
    const member = this.modelFactory.createFromPartial(request);
    const memberWithId = await this.genericRepository.save(member);

    const view = await this.viewFactory.create();
    const links = {};
    const data = view.create(links, memberWithId);

    return { data, links, code: 201 };
  }
}

type AMember = NonNullId<Member> | undefined;

export type MemberPostResponse = HttpResponse<MemberJsonView>;

export interface MemberPostRequest {
  group: string,
  defaultTransportMode: string,
  defaultDistance: number,
  smartcard: string
}
