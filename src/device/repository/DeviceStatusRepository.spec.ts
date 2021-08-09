import * as chai from "chai";
import { DeviceStatusRepository } from "./DeviceStatusRepository";
import { MockDb } from "../../database/GenericRepository.spec";

describe("DeviceStatusRepository", () => {

  it("returns a device status", async () => {
    const records = [];
    const db = new MockDb();
    const repository = new DeviceStatusRepository(db);
    await repository.getDeviceOverview();

    chai.expect(db.sqlQueries[0]).to.equal(
      "SELECT device_id AS deviceId, status, max(received) AS lastUpdate FROM device_status GROUP BY device_id"
    );
  });

});
