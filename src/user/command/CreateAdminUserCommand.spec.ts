import * as chai from "chai";
import { CreateAdminUserCommand } from "./CreateAdminUserCommand";
import { AdminUserFactory } from "../AdminUserFactory";
import { Cryptography } from "../../cryptography/Cryptography";

class MockDb {
  public records: any[] = [];
  public async save(record: any) {
    record.id = 1;
    this.records.push(record);
    return record;
  }
}

describe("CreateAdminUserCommand", () => {
  const db = new MockDb() as any;
  const command = new CreateAdminUserCommand(new AdminUserFactory(new Cryptography()), db);

  it("creates a user", async () => {
    await command.run("user", "some@email.com", "password", "admin");

    chai.expect(db.records[0].name).to.equal("user");
  });

  it("User name must be longer than 2 characters", async () => {
    const error = await command.run("us", "some@email.com", "password", "admin").then(() => false, err => err);

    chai.expect(error).to.equal("User name must be longer than 2 characters");
  });

  it("throws an error if the email is invalid", async () => {
    const error = await command.run("user", "someemail.com", "password", "admin").then(() => false, err => err);

    chai.expect(error).to.equal("Invalid email");
  });

  it("throws an error if the password", async () => {
    const error = await command.run("user", "some@email.com", "pass", "admin").then(() => false, err => err);

    chai.expect(error).to.equal("Password must be longer than 4 characters");
  });
});
