import autobind from "autobind-decorator";
import { HttpResponse } from "../../service/HttpResponse";
import { GenericRepository, NonNullId } from "../../database/GenericRepository";
import { Organisation } from "../Organisation";
import { SchemeIndex, SchemeRepository } from "../../scheme/SchemeRepository";

/**
 * Controller that returns a list of organisations
 */
@autobind
export class OrganisationsController {

  constructor(
    private readonly repository: GenericRepository,
    private readonly schemeRepository: SchemeRepository
  ) {}

  /**
   * Return a list of organisations
   */
  public async get(): Promise<OrganisationsResponse> {
    const links = {};
    const [organisations, schemes] = await Promise.all<Organisations, SchemeIndex>([
      this.repository.selectAll<Organisation>("organisation"),
      this.schemeRepository.getSchemeIndex()
    ]);

    const data = organisations.map(o => this.getOrganisationView(links, schemes, o));

    return { data, links };
  }

  private getOrganisationView(
    links: object,
    schemes: SchemeIndex,
    organisation: NonNullId<Organisation>
  ): OrganisationView {

    const schemeId = "/scheme/" + organisation.scheme_id;

    links[schemeId] = links[schemeId] || schemes[organisation.scheme_id];

    return {
      id: organisation.id,
      name: organisation.name,
      scheme: schemeId
    };
  }
}

type Organisations = NonNullId<Organisation>[];

interface OrganisationView {
  id: number,
  name: string,
  scheme: string
}

export type OrganisationsResponse = HttpResponse<OrganisationView[]>;
