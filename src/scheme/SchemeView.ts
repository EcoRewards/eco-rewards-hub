import { View } from "../service/controller/ReadController";
import { fromSchemeId, Scheme, SchemeJsonView } from "./Scheme";
import { NonNullId } from "../database/GenericRepository";

/**
 * Creates a JSON view of the model and tracks any links
 */
export class SchemeView implements View<Scheme, SchemeJsonView> {

  /**
   * The model and the view are the same for a scheme
   */
  public create(links: object, record: NonNullId<Scheme>): SchemeJsonView {
    return {
      id: fromSchemeId(record.id),
      name: record.name,
      vacClientId: record.vac_client_id
    };
  }

}
