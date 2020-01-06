import * as chai from "chai";
import { CreateGroupCommand } from "./CreateGroupCommand";

class MockDb {
  public records: any[] = [];
  public async save(record: any) {
    record.id = 1;
    this.records.push(record);
    return record;
  }
}

describe("CreateGroupCommand", () => {
  const db = new MockDb() as any;
  const command = new CreateGroupCommand(db);

  it("creates a group", async () => {
    await command.run("group", 1);

    chai.expect(db.records[0].name).to.equal("group");
  });

  it("throws an error if the group name is too short", async () => {
    const error = await command.run("gr", 1).then(() => false, err => err);

    chai.expect(error).to.equal("Group name must be longer than 2 characters");
  });
});
