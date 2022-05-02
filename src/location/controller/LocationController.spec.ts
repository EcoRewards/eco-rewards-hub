import * as chai from "chai";
import { LocationController } from "./LocationController";

class MockController {
  public id: string = "";

  public async delete({ id }: any): Promise<void> {
    this.id = id;
  }
  public async get({ id }: any): Promise<void> {
    this.id = id;
  }
}

describe("LocationController", () => {
  const writeController = new MockController();
  const readController = new MockController();
  const controller = new LocationController(readController as any, writeController as any);

  it("removes the luhn bit from the delete request", async () => {
    await controller.delete({ id: "100110014" });

    chai.expect(writeController.id).to.equal("10011001");
  });

  it("removes the luhn bit from the get request", async () => {
    await controller.get({ id: "100110014" });

    chai.expect(readController.id).to.equal("10011001");
  });

});
