import { ViewFactory } from "../service/controller/ReadController";
import { Organisation, OrganisationJsonView } from "./Organisation";
import { OrganisationView } from "./OrganisationView";
import { GenericRepository } from "../database/GenericRepository";
import { Scheme } from "../scheme/Scheme";
import { SchemeViewFactory } from "../scheme/SchemeViewFactory";

/**
 * Creates an OrganisationViewFactory
 */
export class OrganisationViewFactory implements ViewFactory<Organisation, OrganisationJsonView> {

  constructor(
    private readonly repository: GenericRepository<Scheme>,
    private readonly schemeViewFactory: SchemeViewFactory
  ) { }

  public async create(): Promise<OrganisationView> {
    const [schemes, schemeView] = await Promise.all([
      await this.repository.getIndexedById(),
      await this.schemeViewFactory.create()
    ]);
    return new OrganisationView(schemes, schemeView);
  }

}
