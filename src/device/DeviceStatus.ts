export interface DeviceStatus {
  id: DeviceStatusId | null,
  received: string,
  device_id: string,
  status: string
}

export interface DeviceStatusJsonView {
  received: string,
  deviceId: string,
  status: string
}

export type DeviceStatusId = number;
