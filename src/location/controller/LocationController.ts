import { GetRequest, GetResponse, ReadController } from "../../service/controller/ReadController";
import { Location, LocationJsonView, toLocationId } from "../Location";
import { DeleteRequest, DeleteResponse, WriteController } from "../../service/controller/WriteController";
import autobind from "autobind-decorator";

/**
 * This controller removes the Luhn bit before passing the ID to the standard read and write controllers
 */
@autobind
export class LocationController {
  constructor(
    private readonly readController: ReadController<Location, LocationJsonView>,
    private readonly writeController: WriteController<LocationJsonView, Location>
  ) { }

  /**
   * Return an item or a 404 if one cannot be found
   */
  public async get({ id }: GetRequest): Promise<GetResponse<LocationJsonView>> {
    id = toLocationId(id) + "";

    return this.readController.get({ id });
  }

  /**
   * Delete the given record
   */
  public async delete({ id }: DeleteRequest): Promise<DeleteResponse> {
    id = toLocationId(id) + "";

    return this.writeController.delete({ id });
  }
}
