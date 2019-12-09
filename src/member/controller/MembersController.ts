import { GenericRepository, NonNullId } from "../../database/GenericRepository";
import { Member, MemberJsonView, toMemberId } from "../Member";
import { MemberViewFactory } from "../MemberViewFactory";
import { HttpResponse } from "../../service/controller/HttpResponse";
import { MemberModelFactory } from "../MemberModelFactory";
import autobind from "autobind-decorator";
import { GetRequest, GetResponse, MemberView, View } from "../..";

/**
 * Controller for bulk creation of members and the get request
 */
@autobind
export class MembersController {

  constructor(
    private readonly repository: GenericRepository<Member>,
    private readonly viewFactory: MemberViewFactory,
    private readonly modelFactory: MemberModelFactory
  ) { }

  /**
   * Create multiple new members in a single request
   */
  public async post(request: MembersPostRequest): Promise<MembersPostResponse> {
    const member = this.modelFactory.createFromPartial(request);
    const members = new Array(request.quantity).fill(member);
    const membersWithId = await this.repository.insertAll(members);

    const view = await this.viewFactory.create();
    const links = {};
    const data = membersWithId.map(m => view.create(links, m));

    return { data, links, code: 201 };
  }

  /**
   * Return a member or a 404 if one cannot be found
   */
  public async get({ id }: GetRequest): Promise<GetResponse<MemberJsonView>> {
    const links = {};
    const [model, view] = await Promise.all<NonNullId<Member> | undefined, MemberView>([
      this.repository.selectOne(toMemberId(id)),
      this.viewFactory.create()
    ]);

    if (!model) {
      return { data: { error: "Not found"}, links, code: 404 };
    }

    const data = view.create(links, model);

    return { data, links };
  }
}

export interface MembersPostRequest {
  group: string,
  defaultTransportMode: string,
  defaultDistance: number,
  quantity: number
}

export type MembersPostResponse = HttpResponse<MemberJsonView[]>;
