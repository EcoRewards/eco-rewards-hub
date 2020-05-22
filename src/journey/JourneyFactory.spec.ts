import * as chai from "chai";
import { JourneyFactory } from "./JourneyFactory";
import { Member } from "../member/Member";
import { MemberModelFactory } from "../member/MemberModelFactory";

class MockRepository {
  private ids = 1;
  public async save(member: Member) {
    member.id = this.ids++;

    return member;
  }
}

describe("JourneyFactory", () => {
  const mockRepository = new MockRepository() as any;
  const factory = new JourneyFactory(
    {
      111222: {
        id: 111222,
        rewards: 0,
        carbon_saving: 0,
        default_distance: 0,
        default_transport_mode: "",
        member_group_id: 1,
        smartcard: null,
        total_miles: 100,
        previous_transport_mode: null
      },
      2: {
        id: 2,
        rewards: 0,
        carbon_saving: 0,
        default_distance: 1.57,
        default_transport_mode: "bus",
        member_group_id: 1,
        smartcard: null,
        total_miles: 100,
        previous_transport_mode: null
      }
      }, {
      "654321002222230099": {
        id: 1,
        rewards: 0,
        carbon_saving: 0,
        default_distance: 1.0,
        default_transport_mode: "bus",
        member_group_id: 1,
        smartcard: "654321002222230099",
        total_miles: 50,
        previous_transport_mode: null
      }
    },
    mockRepository,
    new MemberModelFactory()
  );

  it("throws an error when given an invalid ID", async () => {
    let error = "";

    try {
      await factory.create(["0001112221", "2019-12-09T15:10:05"], 1);
    } catch (e) {
      error = e.message;
    }
    chai.expect(error).to.equal("Invalid account number: 0001112221");
  });

  it("throws an error if the member does not exist", async () => {
    let error = "";

    try {
      await factory.create(["0000000018", "2019-12-09T15:10:05"], 1);
    } catch (e) {
      error = e.message;
    }
    chai.expect(error).to.equal("Cannot find member: 1");
  });

  it("creates a new member for Bracknell residents", async () => {
    const actual = await factory.create(["6338000000000000", "2019-12-09T15:10:05"], 1);

    chai.expect(actual.member_id).to.be.greaterThan(0);
    chai.expect(actual.distance).to.equal(1);
  });

  it("creates a new member for Bracknell rail users", async () => {
    const actual = await factory.create(["633597010900000000", "2019-12-09T15:10:05"], 1);

    chai.expect(actual.member_id).to.be.greaterThan(0);
    chai.expect(actual.distance).to.equal(1);
  });

  it("applies a default distance if none is given", async () => {
    const actual = await factory.create(["0000000026", "2019-12-09T15:10:05"], 1);

    chai.expect(actual.distance).to.equal(1.57);
  });

  it("apples the distance given", async () => {
    const actual = await factory.create(["0000000026", "2019-12-09T15:10:05", "bus", "4.2"], 1);

    chai.expect(actual.distance).to.equal(4.2);
  });

  it("returns an error if there is no default distance and none is given", async () => {
    let error = "";

    try {
      await factory.create(["0001112226", "2019-12-09T15:10:05", "bus"], 1);
    } catch (e) {
      error = e.message;
    }
    chai.expect(error).to.equal("No distance given for 0001112226 and no default set");
  });

  it("applies a default mode if none is given", async () => {
    const actual = await factory.create(["0000000026", "2019-12-09T15:10:05"], 1);

    chai.expect(actual.mode).to.equal("bus");
  });

  it("apples the mode given", async () => {
    const actual = await factory.create(["0000000026", "2019-12-09T15:10:05", "train", "4.2"], 1);

    chai.expect(actual.mode).to.equal("train");
  });

  it("returns an error if there is no default mode and none is given", async () => {
    let error = "";

    try {
      await factory.create(["0001112226", "2019-12-09T15:10:05"], 1);
    } catch (e) {
      error = e.message;
    }
    chai.expect(error).to.equal("No mode given for 0001112226 and no default set");
  });

  it("uses the smartcard index", async () => {
    const actual = await factory.create(["654321002222230099", "2019-12-09T15:10:05"], 1);

    chai.expect(actual.member_id).to.equal(1);
  });

  it("stores the device ID", async () => {
    const actual = await factory.create(["654321002222230099", "2019-12-09T15:10:05"], 1, "123456");

    chai.expect(actual.device_id).to.equal("123456");
  });

});
