import autobind from "autobind-decorator";
import { HttpError, HttpResponse } from "./HttpResponse";
import { DatabaseRecord, Filter, GenericRepository, NonNullId } from "../../database/GenericRepository";

/**
 * Controller that provides access to organisations
 */
@autobind
export class ReadController<M extends DatabaseRecord, V> {

  constructor(
    private readonly repository: GenericRepository<M>,
    private readonly viewFactory: ViewFactory<M, V>
  ) {}

  /**
   * Return an item or a 404 if one cannot be found
   */
  public async get({ id }: GetRequest): Promise<GetResponse<V>> {
    const links = {};
    const [model, view] = await Promise.all([
      this.repository.selectOne(+id),
      this.viewFactory.create()
    ]);

    if (!model) {
      return { data: { error: "Not found"}, links, code: 404 };
    }

    const data = view.create(links, model);

    return { data, links };
  }

  /**
   * Return a list of items
   */
  public async getAll({ page, quantity, filterText, filterField }: PaginatedRequest): Promise<GetAllResponse<V>> {
    const links = {};
    const filter = filterField && filterText ? ({ text: filterText, field: filterField}) : undefined;
    const [{ rows, pagination }, view] = await Promise.all([
      this.getResults(page, quantity, filter),
      this.viewFactory.create()
    ]);

    const data = rows.map(m => view.create(links, m));

    return { data, links, pagination };
  }

  private async getResults(page?: string, quantity?: string, filter?: Filter): Promise<PaginatedResults<M>> {
    if (page && quantity) {
      return this.repository.selectPaginated(+page, +quantity, filter ? [filter] : []);
    } else {
      const rows = await this.repository.selectAll();

      return { rows };
    }
  }

}

type OneModel<T extends DatabaseRecord> = undefined | NonNullId<T>;
export type PaginatedResults<T extends DatabaseRecord> = { rows: NonNullId<T>[], pagination?: { count: number }};

export interface GetRequest {
  id: string
}

export interface PaginatedRequest {
  page?: string,
  quantity?: string,
  filterText?: string,
  filterField?: string
}

export interface ViewFactory<T extends DatabaseRecord, U> {
  create(ids?: number[]): Promise<View<T, U>>;
}

export interface View<T extends DatabaseRecord, U> {
  create(links: object, record: NonNullId<T>): U;
}

export type GetAllResponse<T> = HttpResponse<T[]>;
export type GetResponse<T> = HttpResponse<T | HttpError>;
