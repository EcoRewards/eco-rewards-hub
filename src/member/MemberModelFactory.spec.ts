import * as chai from "chai";
import { MemberModelFactory } from "./MemberModelFactory";

describe("MemberModelFactory", () => {
  const factory = new MemberModelFactory();

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
    chai.expect(actual.total_miles).to.equal(0.0);
    chai.expect(actual.default_distance).to.equal(5.4);
    chai.expect(actual.default_transport_mode).to.equal("train");
  });

  it("creates a partial model from a partial JSON view", async () => {
    const actual = await factory.createPartialModel({
      group: "/group/2",
      defaultDistance: 5.4,
      defaultTransportMode: "train",
      previousTransportMode: "goat"
    });

    chai.expect(actual.id).to.equal(undefined);
    chai.expect(actual.member_group_id).to.equal(2);
    chai.expect(actual.carbon_saving).to.equal(undefined);
    chai.expect(actual.rewards).to.equal(undefined);
    chai.expect(actual.total_miles).to.equal(undefined);
    chai.expect(actual.default_distance).to.equal(5.4);
    chai.expect(actual.default_transport_mode).to.equal("train");
    chai.expect(actual.previous_transport_mode).to.equal("goat");
  });

});
