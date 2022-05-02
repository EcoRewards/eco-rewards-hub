import { View } from "../service/controller/ReadController";
import { NonNullId } from "../database/GenericRepository";
import { fromLocationId, Location, LocationJsonView } from "./Location";

/**
 * Transforms Location models into LocationJsonViews
 */
export class LocationView implements View<Location, LocationJsonView> {

  /**
   * Return the JSON view
   */
  public create(links: object, record: NonNullId<Location>): LocationJsonView {
    const id = fromLocationId(record.id);
    const numericId = id.substr(id.lastIndexOf("/") + 1);

    return {
      ...record,
      id,
      url: `https://www.ecorewards.co.uk/scan?location=${numericId}`
    };
  }

}
