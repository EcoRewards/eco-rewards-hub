import autobind from "autobind-decorator";
import { DatabaseRecord, GenericRepository } from "../../database/GenericRepository";
import { HttpError, HttpResponse } from "./HttpResponse";
import { ViewFactory } from "./ReadController";

/**
 * Controller that provides write access to a resource
 */
@autobind
export class WriteController<V, M extends DatabaseRecord> {

  constructor(
    private readonly repository: GenericRepository<M>,
    private readonly modelFactory: ModelFactory<V, M>,
    private readonly viewFactory: ViewFactory<M, V>
  ) {}

  /**
   * Create the model from a view, save it in the database then convert it back to a view and return it with the links
   * populated.
   */
  public async post(request: V): Promise<PostResponse<V>> {
    const model = await this.modelFactory.create(request);
    const savedModel = await this.repository.save(model);

    const links = {};
    const view = await this.viewFactory.create();
    const data = view.create(links, savedModel);

    return { data, links, code: 201 };
  }

  /**
   * Same as POST but returns a 200
   */
  public async put(request: V): Promise<PostResponse<V>> {
    const model = await this.modelFactory.create(request);
    const savedModel = await this.repository.save(model);

    const links = {};
    const view = await this.viewFactory.create();
    const data = view.create(links, savedModel);

    return { data, links };
  }

  /**
   * Delete the given record
   */
  public async delete({ id }: DeleteRequest): Promise<DeleteResponse> {
    await this.repository.deleteOne(+id);

    return {
      data: "success",
      links: {}
    }
  }
}

export interface ModelFactory<V, M> {
  create(view: V): Promise<M>
}

export type PostResponse<V> = HttpResponse<V | HttpError>;

export type DeleteResponse = HttpResponse<string>;

export interface DeleteRequest {
  id: string
}
