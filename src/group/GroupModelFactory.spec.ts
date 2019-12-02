import * as chai from "chai";
import { GroupModelFactory } from "./GroupModelFactory";

describe("GroupModelFactory", () => {
  const factory = new GroupModelFactory();

  it("creates a model from a JSON view", async () => {
    const actual = await factory.create({
      id: "/group/1",
      name: "group",
      organisation: "/organisation/2"
    });

    chai.expect(actual.id).to.equal(1);
    chai.expect(actual.name).to.equal("group");
    chai.expect(actual.organisation_id).to.equal(2);
  });

  it("creates a model from a JSON view", async () => {
    const actual = await factory.create({
      name: "group",
      organisation: "/organisation/2"
    });

    chai.expect(actual.id).to.equal(null);
    chai.expect(actual.name).to.equal("group");
    chai.expect(actual.organisation_id).to.equal(2);
  });

});
