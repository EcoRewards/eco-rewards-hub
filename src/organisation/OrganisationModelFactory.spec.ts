import * as chai from "chai";
import { OrganisationModelFactory } from "./OrganisationModelFactory";

describe("OrganisationModelFactory", () => {
  const factory = new OrganisationModelFactory();

  it("creates a model from a JSON view", async () => {
    const actual = await factory.create({
      id: "/organisation/1",
      name: "org",
      scheme: "/scheme/2"
    });

    chai.expect(actual.id).to.equal(1);
    chai.expect(actual.name).to.equal("org");
    chai.expect(actual.scheme_id).to.equal(2);
  });

  it("creates a model from a JSON view", async () => {
    const actual = await factory.create({
      name: "org",
      scheme: "/scheme/2"
    });

    chai.expect(actual.id).to.equal(null);
    chai.expect(actual.name).to.equal("org");
    chai.expect(actual.scheme_id).to.equal(2);
  });

});
