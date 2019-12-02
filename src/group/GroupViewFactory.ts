import { ViewFactory } from "../service/controller/ReadController";
import { Group, GroupJsonView } from "./Group";
import { GenericRepository } from "../database/GenericRepository";
import { Organisation } from "../organisation/Organisation";
import { GroupView } from "./GroupView";
import { SchemeViewFactory } from "../scheme/SchemeViewFactory";
import { OrganisationViewFactory } from "../organisation/OrganisationViewFactory";

/**
 * Creates a GroupViewFactory
 */
export class GroupViewFactory implements ViewFactory<Group, GroupJsonView> {

  constructor(
    private readonly repository: GenericRepository<Organisation>,
    private readonly organisationViewFactory: OrganisationViewFactory
  ) { }

  /**
   * Load the organisation index and the organisation view factory for the GroupView
   */
  public async create(): Promise<GroupView> {
    const [organisations, organisationViewFactory] = await Promise.all([
      this.repository.getIndexedById(),
      this.organisationViewFactory.create()
    ]);

    return new GroupView(organisations, organisationViewFactory);
  }

}
