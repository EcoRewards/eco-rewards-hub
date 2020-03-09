import * as chai from "chai";
import { DeviceStatusView } from "./DeviceStatusView";

describe("DeviceStatusView", () => {
  const view = new DeviceStatusView();

  it("creates a JSON view from a model", async () => {
    const actual = await view.create({}, {
      id: 1,
      received: "2019-12-11T10:02:20",
      status: "04 12 88 04 00 00 00 25 20 20 03 09 02 37 00 00 17 64 38 44 00 04 00 00 00",
      device_id: "123456"
    });

    chai.expect(actual.received).to.equal("2019-12-11T10:02:20");
    chai.expect(actual.status).to.equal("04 12 88 04 00 00 00 25 20 20 03 09 02 37 00 00 17 64 38 44 00 04 00 00 00");
  });

});
