import { ModelFactory } from "../service/controller/WriteController";
import { Scheme, SchemeJsonView, toSchemeId } from "./Scheme";

/**
 * Create a Scheme model from a SchemeJsonView
 */
export class SchemeModelFactory implements ModelFactory<SchemeJsonView, Scheme> {

  /**
   * In this case the Model and the JsonView are the same
   */
  public async create(view: SchemeJsonView): Promise<Scheme> {
    return {
      id: view.id ? toSchemeId(view.id) : null,
      name: view.name
    };
  }

}
