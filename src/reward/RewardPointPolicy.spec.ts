import * as chai from "chai";
import { RewardPointPolicy } from "./RewardPointPolicy";

describe("RewardPointPolicy", () => {
  const policy = new RewardPointPolicy();

  it("calculates reward points", async () => {
    const points = policy.getRewardPoints("Walk", 5, 0);

    chai.expect(points).to.equal(250);
  });

  it("caps reward points", async () => {
    const points = policy.getRewardPoints("Walk", 5, 250);

    chai.expect(points).to.equal(150);
  });

});
