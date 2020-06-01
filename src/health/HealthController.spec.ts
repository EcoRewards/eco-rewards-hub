import * as chai from "chai";
import { HealthController } from "./HealthController";

describe("HealthController", () => {

  it("returns UP", () => {
    const controller = new HealthController();
    const result = controller.get();
    chai.expect(result.status).to.equal("UP");
  });

});
