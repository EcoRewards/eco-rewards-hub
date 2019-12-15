import * as chai from "chai";
import { CarbonSavingPolicy } from "./CarbonSavingPolicy";

describe("CarbonSavingPolicy", () => {
  const carbonSavingPolicy = new CarbonSavingPolicy();

  it("factors in distance to carbon savings", async () => {
    const saving = carbonSavingPolicy.getCarbonSaving("Walk", 1);
    const savingOver5Miles = carbonSavingPolicy.getCarbonSaving("Walk", 5);

    chai.expect(savingOver5Miles).to.equal(saving * 5);
  });

});
