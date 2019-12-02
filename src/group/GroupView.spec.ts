import * as chai from "chai";
import { GroupView } from "./GroupView";
import { OrganisationView } from "../organisation/OrganisationView";

describe("GroupView", () => {
  const view = new GroupView({
      1: { id: 1, name: "org1", scheme_id: 1 },
      2: { id: 2, name: "org2", scheme_id: 2 }
    },
    new OrganisationView({
      1: { id: 1, name: "scheme1" },
      2: { id: 2, name: "scheme2" }
    })
  );

  it("creates a JSON view from a model", async () => {
    const actual = await view.create({}, {
      id: 1,
      name: "group",
      organisation_id: 2
    });

    chai.expect(actual.id).to.equal("/group/" + 1);
    chai.expect(actual.name).to.equal("group");
    chai.expect(actual.organisation).to.equal("/organisation/" + 2);
  });

  it("populates the links object", async () => {
    const links = {};
    const actual = await view.create(links, {
      id: 1,
      name: "org",
      organisation_id: 2
    });

    chai.expect(links["/organisation/1"]).to.equal(undefined);
    chai.expect(links["/organisation/2"].name).to.equal("org2");
    chai.expect(links["/scheme/2"].name).to.equal("scheme2");
  });

});
