import autobind from "autobind-decorator";
import { HttpResponse } from "../../service/controller/HttpResponse";
import { DeviceOverview, DeviceStatusRepository } from "../repository/DeviceStatusRepository";

/**
 * /device-overview endpoints
 */
@autobind
export class DeviceOverviewController {

  constructor(
    private readonly repository: DeviceStatusRepository,
  ) { }

  /**
   * Return an overview of devices
   */
  public async get(): Promise<HttpResponse<DeviceOverview>> {
    return {
      data: await this.repository.getDeviceOverview(),
      links: {}
    };
  }

}
