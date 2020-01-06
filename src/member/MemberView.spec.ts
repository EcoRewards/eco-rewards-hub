import * as chai from "chai";
import { MemberView } from "./MemberView";
import { OrganisationView } from "../organisation/OrganisationView";
import { GroupView } from "../group/GroupView";
import { SchemeView } from "..";

describe("MemberView", () => {
  const groupView = new GroupView({
      1: { id: 1, name: "org1", scheme_id: 1 },
      2: { id: 2, name: "org2", scheme_id: 2 }
    },
    new OrganisationView({
      1: { id: 1, name: "scheme1" },
      2: { id: 2, name: "scheme2" }
    }, new SchemeView())
  );

  const view = new MemberView({
    1: { id: 1, name: "group1", organisation_id: 1 },
    2: { id: 2, name: "group2", organisation_id: 2 }
  }, groupView);

  it("creates a JSON view from a model", async () => {
    const actual = await view.create({}, {
      id: 1,
      member_group_id: 2,
      carbon_saving: 4.3,
      rewards: 1700,
      default_distance: 5.4,
      default_transport_mode: "train",
      smartcard: null
    });

    chai.expect(actual.id).to.equal("/member/0000000018");
    chai.expect(actual.group).to.equal("/group/" + 2);
    chai.expect(actual.carbonSaving).to.equal(4.3);
    chai.expect(actual.rewards).to.equal(1700);
    chai.expect(actual.defaultDistance).to.equal(5.4);
    chai.expect(actual.defaultTransportMode).to.equal("train");
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
      smartcard: null
    });

    chai.expect(links["/group/1"]).to.equal(undefined);
    chai.expect(links["/group/2"].name).to.equal("group2");
    chai.expect(links["/organisation/2"].name).to.equal("org2");
    chai.expect(links["/scheme/2"].name).to.equal("scheme2");
  });

});
