import * as chai from "chai";
import { TrophyView } from "./TrophyView";

describe("TrophyView", () => {
  const view = new TrophyView();

  it("creates a JSON view from a model", async () => {
    const actual = await view.create({}, {
      id: 10011001,
      name: "Trophy",
      member_id: 10011001,
      date_awarded: new Date("2018-01-01T00:00:00.000Z"),
      member_group_id: 10011001,
      rewards: 100,
      carbon_saving: 100,
      miles: 100
    });

    chai.expect(actual.id).to.equal("/trophy/10011001");
    chai.expect(actual.name).to.equal("Trophy");
    chai.expect(actual.member).to.equal("/member/0100110014");
    chai.expect(actual.dateAwarded).to.equal("2018-01-01T00:00:00.000Z");
    chai.expect(actual.memberGroup).to.equal("/group/10011001");
    chai.expect(actual.rewards).to.equal(100);
    chai.expect(actual.carbonSaving).to.equal(100);
    chai.expect(actual.miles).to.equal(100);
  });

});
