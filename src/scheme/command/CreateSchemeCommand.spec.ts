import * as chai from "chai";
import { CreateSchemeCommand } from "./CreateSchemeCommand";

class MockDb {
  public records: any[] = [];
  public async save(record: any) {
    record.id = 1;
    this.records.push(record);
    return record;
  }
}

describe("CreateSchemeCommand", () => {
  const db = new MockDb() as any;
  const command = new CreateSchemeCommand(db);

  it("creates a scheme", async () => {
    await command.run("scheme");

    chai.expect(db.records[0].name).to.equal("scheme");
  });

  it("throws an error if the scheme name is too short", async () => {
    const error = await command.run("gr").then(() => false, err => err);

    chai.expect(error.toString()).to.equal(new Error("Scheme name must be at least 3 characters long").toString());
  });
});
