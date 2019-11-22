import * as chai from "chai";
import { AdminUserFactory } from "./AdminUserFactory";
import { Cryptography } from "../cryptography/Cryptography";

describe("AdminUserFactory", () => {
  const factory = new AdminUserFactory(new Cryptography());

  it("creates an organisation", async () => {
    const organisation = await factory.create("User", "test@test.com", "password", "admin");

    chai.expect(organisation.id).to.equal(null);
  });

  it("hashes the password", async () => {
    const organisation = await factory.create("User", "test@test.com", "password", "admin");

    chai.expect(organisation.password).to.not.equal("password");
  });

});
