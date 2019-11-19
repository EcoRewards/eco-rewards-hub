import * as chai from "chai";
import { OrganisationFactory } from "./OrganisationFactory";
import { Cryptography } from "../cryptography/Cryptography";

describe("OrganisationFactory", () => {
  const factory = new OrganisationFactory(new Cryptography());

  it("creates an organisation", async () => {
    const organisation = await factory.create("my org", 1, "key");

    chai.expect(organisation.id).to.equal(null);
  });

  it("hashes the API key", async () => {
    const organisation = await factory.create("my org", 1, "key");

    chai.expect(organisation.api_key).to.not.equal("key");
  });

});
