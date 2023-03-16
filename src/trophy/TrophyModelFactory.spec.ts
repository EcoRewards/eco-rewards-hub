import * as chai from "chai";
import { TrophyModelFactory } from "./TrophyModelFactory";

describe("TrophyModelFactory", () => {
  const factory = new TrophyModelFactory();

  it("creates a model from a JSON view", async () => {
    const actual = await factory.create({
      id: "/trophy/100110014",
      name: "Trophy",
      member: "/member/100110014",
      dateAwarded: "2018-01-01T00:00:00.000Z",
      memberGroup: "/group/10011001",
      rewards: 100,
      carbonSaving: 100,
      miles: 100
    });

    chai.expect(actual.id).to.equal(100110014);
    chai.expect(actual.name).to.equal("Trophy");
    chai.expect(actual.member_id).to.equal(100110014);
    chai.expect(actual.date_awarded.toISOString()).to.equal("2018-01-01T00:00:00.000Z");
    chai.expect(actual.member_group_id).to.equal(10011001);
    chai.expect(actual.rewards).to.equal(100);
    chai.expect(actual.carbon_saving).to.equal(100);
    chai.expect(actual.miles).to.equal(100);
  });

});
