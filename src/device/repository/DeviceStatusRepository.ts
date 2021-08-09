
/**
 * Provides access to the device_status table
 */
export class DeviceStatusRepository {
  constructor(
    private readonly db: any
  ) { }

  public async getDeviceOverview(): Promise<DeviceOverview> {
    const [rows] = await this.db.query(
      "SELECT device_id AS deviceId, status, max(received) AS lastUpdate FROM device_status GROUP BY device_id"
    );

    return rows;
  }
}

export interface DeviceOverview {
  deviceId: string,
  status: string,
  lastUpdate: string
}
