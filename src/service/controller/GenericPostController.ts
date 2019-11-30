import autobind from "autobind-decorator";
import { DatabaseRecord, GenericRepository } from "../../database/GenericRepository";
import { HttpError, HttpResponse } from "./HttpResponse";
import { ViewFactory } from "./GenericGetController";

/**
 * Generic POST controller that creates resources
 */
@autobind
export class GenericPostController<V, M extends DatabaseRecord> {

  constructor(
    private readonly repository: GenericRepository<M>,
    private readonly modelFactory: ModelFactory<V, M>,
    private readonly viewFactory: ViewFactory<M, V>
  ) {}

  /**
   * Create the model from a view, save it in the database then convert it back to a view and return it with the links
   * populated.
   */
  public async post({ request }: PostRequest<V>): Promise<PostResponse<V>> {
    const model = await this.modelFactory.create(request.body);
    const savedModel = await this.repository.save(model);

    const links = {};
    const view = await this.viewFactory.create();
    const data = view.create(links, savedModel);

    return { data, links, code: 201 };
  }
}

interface PostRequest<V> {
  request: {
    body: V
  }
}

export interface ModelFactory<V, M> {
  create(view: V): Promise<M>
}

export type PostResponse<V> = HttpResponse<V | HttpError>;
