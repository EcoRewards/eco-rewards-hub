import * as chai from "chai";
import { DeviceStatusViewFactory } from "./DeviceStatusViewFactory";

describe("DeviceStatusViewFactory", () => {
  const view = new DeviceStatusViewFactory();

  it("creates a JSON view", async () => {
    const actual = await view.create();

    chai.expect(actual).to.not.equal(null);
  });

});
