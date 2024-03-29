import * as chai from "chai";
import { MemberView } from "./MemberView";
import { OrganisationView } from "../organisation/OrganisationView";
import { GroupView } from "../group/GroupView";
import { SchemeView } from "../scheme/SchemeView";
import { TrophyView } from "../trophy/TrophyView";

describe("MemberView", () => {
  const groupView = new GroupView({
      1: { id: 1, name: "org1", scheme_id: 1 },
      2: { id: 2, name: "org2", scheme_id: 2 }
    },
    new OrganisationView({
      1: { id: 1, name: "scheme1", vac_client_id: 155 },
      2: { id: 2, name: "scheme2", vac_client_id: 155 }
    }, new SchemeView())
  );

  const trophyView = new TrophyView();
  const trophy = {
    id: 1,
    name: "Trophy",
    member_id: 1,
    member_group_id: 1,
    date_awarded: "2018-01-01T00:00:00.000Z",
    rewards: 100,
    carbon_saving: 100,
    miles: 100
  };

  const view = new MemberView({
    1: { id: 1, name: "group1", organisation_id: 1 },
    2: { id: 2, name: "group2", organisation_id: 2 }
  }, {
    1: [trophy],
  }, groupView, trophyView);

  it("creates a JSON view from a model", async () => {
    const actual = await view.create({}, {
      id: 1,
      member_group_id: 2,
      carbon_saving: 4.3,
      rewards: 1700,
      default_distance: 5.4,
      default_transport_mode: "train",
      smartcard: null,
      total_miles: 1.0,
      previous_transport_mode: null
    });

    chai.expect(actual.id).to.equal("/member/0000000018");
    chai.expect(actual.group).to.equal("/group/" + 2);
    chai.expect(actual.carbonSaving).to.equal(4.3);
    chai.expect(actual.rewards).to.equal(1700);
    chai.expect(actual.defaultDistance).to.equal(5.4);
    chai.expect(actual.totalMiles).to.equal(1.0);
    chai.expect(actual.defaultTransportMode).to.equal("train");
    chai.expect(actual.trophies).to.deep.equal(["/trophy/1"]);
  });

  it("uses the smartcard ID as the ID if there is one", async () => {
    const actual = await view.create({}, {
      id: 1,
      member_group_id: 2,
      carbon_saving: 4.3,
      rewards: 1700,
      default_distance: 5.4,
      default_transport_mode: "train",
      smartcard: "123123123123123123",
      total_miles: 0,
      previous_transport_mode: null
    });

    chai.expect(actual.id).to.equal("/member/123123123123123123");
  });

  it("populates the links object", async () => {
    const links = {};
    const actual = await view.create(links, {
      id: 1,
      member_group_id: 2,
      carbon_saving: 4.3,
      rewards: 1700,
      default_distance: 5.4,
      default_transport_mode: "train",
      smartcard: null,
      total_miles: 1,
      previous_transport_mode: null
    });

    chai.expect(links["/group/1"]).to.equal(undefined);
    chai.expect(links["/group/2"].name).to.equal("group2");
    chai.expect(links["/organisation/2"].name).to.equal("org2");
    chai.expect(links["/scheme/2"].name).to.equal("scheme2");
    chai.expect(links["/trophy/1"].name).to.equal("Trophy");
  });

});
