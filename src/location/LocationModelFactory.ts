import { ModelFactory } from "../service/controller/WriteController";
import { Location, LocationJsonView, toLocationId } from "./Location";

/**
 * Create a Location model from a LocationJsonView
 */
export class LocationModelFactory implements ModelFactory<LocationJsonView, Location> {

  /**
   * In this case the Model and the JsonView are the same
   */
  public async create(view: LocationJsonView): Promise<Location> {
    return {
      id: view.id ? toLocationId(view.id) : null,
      name: view.name,
      notes: view.notes,
      defaultJourneyType: view.defaultJourneyType
    };
  }

}
