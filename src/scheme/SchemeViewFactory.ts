import { ViewFactory } from "../service/controller/ReadController";
import { Scheme, SchemeJsonView } from "./Scheme";
import { SchemeView } from "./SchemeView";

/**
 * Creates a new SchemeView
 */
export class SchemeViewFactory implements ViewFactory<Scheme, SchemeJsonView> {

  /**
   * No set up required, just return the view
   */
  public async create(): Promise<SchemeView> {
    return new SchemeView();
  }

}
