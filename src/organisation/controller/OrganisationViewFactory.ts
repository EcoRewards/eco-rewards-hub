import { ViewFactory } from "../../service/controller/GenericController";
import { Organisation, OrganisationJsonView } from "../Organisation";
import { OrganisationView } from "./OrganisationView";
import { GenericRepository } from "../../database/GenericRepository";
import { Scheme } from "../../scheme/Scheme";

/**
 * Creates an OrganisationViewFactory
 */
export class OrganisationViewFactory implements ViewFactory<Organisation, OrganisationJsonView> {

  constructor(
    private readonly repository: GenericRepository<Scheme>
  ) { }

  public async create(): Promise<OrganisationView> {
    return new OrganisationView(
      await this.repository.getIndexedById()
    );
  }

}
