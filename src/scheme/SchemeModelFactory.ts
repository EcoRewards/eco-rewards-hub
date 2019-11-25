import { ModelFactory } from "../service/controller/GenericPostController";
import { Scheme, SchemeJsonView } from "./Scheme";

/**
 * Create a Scheme model from a SchemeJsonView
 */
export class SchemeModelFactory implements ModelFactory<SchemeJsonView, Scheme> {

  /**
   * In this case the Model and the JsonView are the same
   */
  public async create(view: SchemeJsonView): Promise<Scheme> {
    return view;
  }

}
