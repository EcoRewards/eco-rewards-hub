import * as chai from "chai";
import { AdminFactory } from "./AdminFactory";
import { Cryptography } from "../cryptography/Cryptography";

describe("AdminUserFactory", () => {
  const factory = new AdminFactory(new Cryptography());

  it("creates an organisation", async () => {
    const organisation = await factory.create("User", "test@test.com", "password");

    chai.expect(organisation.id).to.equal(null);
  });

  it("hashes the password", async () => {
    const organisation = await factory.create("User", "test@test.com", "password");

    chai.expect(organisation.password).to.not.equal("password");
  });

});
