import * as chai from "chai";
import { JourneyView } from "./JourneyView";

describe("JourneyView", () => {
  const view = new JourneyView(
    {
      1: { name: "Linus Norton" } as any,
    },
    {
      1: {
        id: 1,
        rewards: 0,
        carbon_saving: 0,
        default_distance: 0,
        default_transport_mode: "",
        member_group_id: 1,
        smartcard: null,
      }
    }
  );

  it("creates a JSON view from a model", async () => {
    const actual = await view.create({}, {
      id: 1,
      admin_user_id: 1,
      uploaded: "2019-12-11T22:04:50",
      processed: null,
      travel_date: "2019-12-11T10:02:20",
      member_id: 1,
      distance: 1.56,
      mode: "Train",
      rewards_earned: null,
      carbon_saving: null,
    });

    chai.expect(actual.id).to.equal(1);
    chai.expect(actual.source).to.equal("Linus Norton");
    chai.expect(actual.uploaded).to.equal("2019-12-11T22:04:50");
    chai.expect(actual.processed).to.equal(null);
    chai.expect(actual.travelDate).to.equal("2019-12-11T10:02:20");
    chai.expect(actual.member).to.equal("/member/0000000018");
    chai.expect(actual.distance).to.equal(1.56);
    chai.expect(actual.mode).to.equal("Train");
    chai.expect(actual.rewardsEarned).to.equal(null);
    chai.expect(actual.carbonSaving).to.equal(null);

  });

});
