import { ViewFactory } from "../service/controller/ReadController";
import { Location, LocationJsonView } from "./Location";
import { LocationView } from "./LocationView";

/**
 * Creates a LocationView
 */
export class LocationViewFactory implements ViewFactory<Location, LocationJsonView> {

  public async create(): Promise<LocationView> {
    return new LocationView();
  }

}
