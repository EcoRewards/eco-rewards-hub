import { ViewFactory } from "../service/controller/ReadController";
import { Journey, JourneyJsonView } from "./Journey";
import { GenericRepository } from "../database/GenericRepository";
import { JourneyView } from "./JourneyView";
import { AdminUser } from "../user/AdminUser";

/**
 * Creates a JourneyView
 */
export class JourneyViewFactory implements ViewFactory<Journey, JourneyJsonView> {

  constructor(
    private readonly repository: GenericRepository<AdminUser>
  ) { }

  /**
   * Load the admin index for the JourneyView
   */
  public async create(): Promise<JourneyView> {
    return new JourneyView(await this.repository.getIndexedById());
  }

}
