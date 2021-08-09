import * as chai from "chai";
import { DeviceOverviewController } from "./DeviceOverviewController";
import { DeviceStatusRepository } from "../repository/DeviceStatusRepository";

class MockRepository {

  async getDeviceOverview() {
    return [
      { deviceId: "1", status: "2", lastUpdate: "2010-10-10" }
    ];
  }

}

describe("DeviceOverviewController", () => {
  it("returns device overview", async () => {
    const controller = new DeviceOverviewController(new MockRepository() as any as DeviceStatusRepository);

    const result = await controller.get();
    const expected = [
      { deviceId: "1", status: "2", lastUpdate: "2010-10-10" }
    ];

    chai.expect(result.data).to.deep.equal(expected);
  });

});
