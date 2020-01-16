import { ViewFactory } from "../service/controller/ReadController";
import { Journey, JourneyJsonView } from "./Journey";
import { GenericRepository } from "../database/GenericRepository";
import { JourneyView } from "./JourneyView";
import { AdminUser } from "../user/AdminUser";
import { Member } from "../member/Member";

/**
 * Creates a JourneyView
 */
export class JourneyViewFactory implements ViewFactory<Journey, JourneyJsonView> {

  constructor(
    private readonly adminRepository: GenericRepository<AdminUser>,
    private readonly memberRepository: GenericRepository<Member>
  ) { }

  /**
   * Load the admins and members for the JourneyView
   */
  public async create(): Promise<JourneyView> {
    const [admins, members] = await Promise.all([
      this.adminRepository.getIndexedById(),
      this.memberRepository.getIndexedById()
    ]);

    return new JourneyView(admins, members);
  }

}
