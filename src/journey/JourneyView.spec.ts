import * as chai from "chai";
import { JourneyView } from "./JourneyView";

describe("JourneyView", () => {
  const view = new JourneyView({
    1: { name: "Linus Norton" } as any
  });

  it("creates a JSON view from a model", async () => {
    const actual = view.create({}, {
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
      device_id: "123456",
      latitude: null,
      longitude: null,
      type: "journey"
    });

    chai.expect(actual.source).to.equal("Linus Norton");
    chai.expect(actual.uploaded).to.equal("2019-12-11T22:04:50");
    chai.expect(actual.processed).to.equal(null);
    chai.expect(actual.travelDate).to.equal("2019-12-11T10:02:20");
    chai.expect(actual.memberId).to.equal("/member/0000000018");
    chai.expect(actual.distance).to.equal(1.56);
    chai.expect(actual.mode).to.equal("Train");
    chai.expect(actual.rewardsEarned).to.equal(null);
    chai.expect(actual.carbonSaving).to.equal(null);
    chai.expect(actual.deviceId).to.equal("123456");
    chai.expect(actual.type).to.equal("journey");
  });

});
