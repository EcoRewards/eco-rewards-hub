import { Scheme } from "./Scheme";

/**
 * Creates new Schemes
 */
export class SchemeFactory {

  /**
   * Create a name scheme with the given name and a null id
   */
  public create(name: string): Scheme {
    return { id: null, name };
  }

}