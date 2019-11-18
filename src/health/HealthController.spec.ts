import * as chai from "chai";
import * as pino from "pino";
import { HealthController } from "./HealthController";

describe("HealthController", () => {

  it("returns UP", () => {
    const controller = new HealthController();
    const result = controller.get();
    chai.expect(result.status).to.equal("UP");
  });

});
