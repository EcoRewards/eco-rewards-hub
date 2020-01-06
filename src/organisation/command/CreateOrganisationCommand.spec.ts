import * as chai from "chai";
import { CreateOrganisationCommand } from "./CreateOrganisationCommand";

class MockDb {
  public records: any[] = [];
  public async save(record: any) {
    record.id = 1;
    this.records.push(record);
    return record;
  }
}

describe("CreateOrganisationCommand", () => {
  const db = new MockDb() as any;
  const command = new CreateOrganisationCommand(db);

  it("creates a organisation", async () => {
    await command.run("organisation", 1);

    chai.expect(db.records[0].name).to.equal("organisation");
  });

  it("throws an error if the organisation name is too short", async () => {
    const error = await command.run("gr", 1).then(() => false, err => err);

    chai.expect(error).to.equal("Organisation name must be longer than 2 characters");
  });
});
