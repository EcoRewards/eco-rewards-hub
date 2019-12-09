import * as chai from "chai";
import { JourneyFactory } from "./JourneyFactory";

describe("JourneyFactory", () => {
  const factory = new JourneyFactory({
    111222: {
      id: 111222,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 0,
      default_transport_mode: "",
      member_group_id: 1
    },
    2: {
      id: 2,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.57,
      default_transport_mode: "bus",
      member_group_id: 1
    }
  });

  it("throws an error when given an  invalid ID", () => {
    chai.expect(() => {
      factory.create(["3023110001112221", "2019-12-09T15:10:05"], 1);
    }).to.throw(Error, "Invalid account number");
  });

  it("throws an error if the member does not exist", () => {
    chai.expect(() => {
      factory.create(["3023110000000012", "2019-12-09T15:10:05"], 1);
    }).to.throw(Error, "Cannot find member: 3023110000000012");
  });

  it("applies a default distance if none is given", () => {
    const actual = factory.create(["3023110000000020", "2019-12-09T15:10:05"], 1);

    chai.expect(actual.distance).to.equal(1.57);
  });

  it("apples the distance given", () => {
    const actual = factory.create(["3023110000000020", "2019-12-09T15:10:05", "bus", "4.2"], 1);

    chai.expect(actual.distance).to.equal(4.2);
  });

  it("returns an error if there is no default distance and none is given", () => {
    chai.expect(() => {
      factory.create(["3023110001112220", "2019-12-09T15:10:05", "bus"], 1);
    }).to.throw(Error, "No distance given for 3023110001112220 and no default set");
  });

  it("applies a default mode if none is given", () => {
    const actual = factory.create(["3023110000000020", "2019-12-09T15:10:05"], 1);

    chai.expect(actual.mode).to.equal("bus");
  });

  it("apples the mode given", () => {
    const actual = factory.create(["3023110000000020", "2019-12-09T15:10:05", "train", "4.2"], 1);

    chai.expect(actual.mode).to.equal("train");
  });

  it("returns an error if there is no default mode and none is given", () => {
    chai.expect(() => {
      factory.create(["3023110001112220", "2019-12-09T15:10:05"], 1);
    }).to.throw(Error, "No mode given for 3023110001112220 and no default set");
  });

});
