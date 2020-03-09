import { ViewFactory } from "../service/controller/ReadController";
import { DeviceStatus, DeviceStatusJsonView } from "./DeviceStatus";
import { DeviceStatusView } from "./DeviceStatusView";

/**
 * Creates a DeviceStatusView
 */
export class DeviceStatusViewFactory implements ViewFactory<DeviceStatus, DeviceStatusJsonView> {

  public async create(): Promise<DeviceStatusView> {
    return new DeviceStatusView();
  }

}
