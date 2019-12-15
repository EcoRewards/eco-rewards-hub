import * as chai from "chai";
import { RewardPointPolicy } from "./RewardPointPolicy";
import { CarbonSavingPolicy } from "./CarbonSavingPolicy";

describe("RewardPointPolicy", () => {
  const policy = new RewardPointPolicy(new CarbonSavingPolicy());

  it("calculates reward points", async () => {
    const points = policy.getRewardPoints("Walk", 5, 0);

    chai.expect(points).to.equal(161);
  });

  it("caps reward points", async () => {
    const points = policy.getRewardPoints("Walk", 5, 380);

    chai.expect(points).to.equal(20);
  });

});
