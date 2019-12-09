import * as chai from "chai";
import { MemberModelFactory } from "./MemberModelFactory";

describe("MemberModelFactory", () => {
  const factory = new MemberModelFactory();

  it("creates a model from a JSON view", async () => {
    const actual = await factory.create({
      id: "/member/3023110000000012",
      group: "/group/2",
      carbonSaving: 4.3,
      rewards: 1700,
      defaultDistance: 5.4,
      defaultTransportMode: "train"
    });

    chai.expect(actual.id).to.equal(1);
    chai.expect(actual.member_group_id).to.equal(2);
    chai.expect(actual.carbon_saving).to.equal(4.3);
    chai.expect(actual.rewards).to.equal(1700);
    chai.expect(actual.default_distance).to.equal(5.4);
    chai.expect(actual.default_transport_mode).to.equal("train");
  });

  it("creates a model from a partial JSON view", async () => {
    const actual = await factory.createFromPartial({
      group: "/group/2",
      defaultDistance: 5.4,
      defaultTransportMode: "train"
    });

    chai.expect(actual.id).to.equal(null);
    chai.expect(actual.member_group_id).to.equal(2);
    chai.expect(actual.carbon_saving).to.equal(0);
    chai.expect(actual.rewards).to.equal(0);
    chai.expect(actual.default_distance).to.equal(5.4);
    chai.expect(actual.default_transport_mode).to.equal("train");
  });
});
