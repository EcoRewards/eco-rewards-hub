import { View } from "../service/controller/ReadController";
import { NonNullId } from "../database/GenericRepository";
import { DeviceStatus, DeviceStatusJsonView } from "./DeviceStatus";

/**
 * Transforms DeviceStatus models into DeviceStatusViews
 */
export class DeviceStatusView implements View<DeviceStatus, DeviceStatusJsonView> {

  /**
   * Return the JSON view
   */
  public create(links: object, record: NonNullId<DeviceStatus>): DeviceStatusJsonView {
    return {
      received: record.received,
      status: record.status,
      deviceId: record.device_id
    };
  }

}
