import autobind from "autobind-decorator";
import { HttpError, HttpResponse } from "./HttpResponse";
import { DatabaseRecord, GenericRepository, NonNullId } from "../../database/GenericRepository";

/**
 * Controller that provides access to organisations
 */
@autobind
export class GenericController<M extends DatabaseRecord, V> {

  constructor(
    private readonly repository: GenericRepository<M>,
    private readonly viewFactory: ViewFactory<M, V>
  ) {}

  /**
   * Return an organisation or a 404 if one cannot be found
   */
  public async get(id: number): Promise<GetResponse<V>> {
    const links = {};
    const [model, view] = await Promise.all<OneModel<M>, View<M, V>>([
      this.repository.selectOne(id),
      this.viewFactory.create()
    ]);

    if (!model) {
      return { data: { error: "Not found"}, links, code: 404 };
    }

    const data = view.create(links, model);

    return { data, links };
  }

  /**
   * Return a list of organisations
   */
  public async getAll(): Promise<GetAllResponse<V>> {
    const links = {};
    const [models, view] = await Promise.all<NonNullId<M>[], View<M, V>>([
      this.repository.selectAll(),
      this.viewFactory.create()
    ]);

    const data = models.map(m => view.create(links, m));

    return { data, links };
  }

}

type OneModel<T extends DatabaseRecord> = undefined | NonNullId<T>;

export interface ViewFactory<T extends DatabaseRecord, U> {
  create(): Promise<View<T, U>>;
}

export interface View<T extends DatabaseRecord, U> {
  create(links: object, record: NonNullId<T>): U;
}

export type GetAllResponse<T> = HttpResponse<T[]>;
export type GetResponse<T> = HttpResponse<T | HttpError>;
