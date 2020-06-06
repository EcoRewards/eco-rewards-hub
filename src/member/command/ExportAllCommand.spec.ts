import * as chai from "chai";
import { ExportAllCommand } from "./ExportAllCommand";
import { Member } from "../Member";

class MockRepository {
  called = false;
  constructor(
    private readonly results: object
  ) { }

  public async selectAll() {
    this.called = true;

    return this.results;
  }
}

class MockApi {
  exported = {};

  public async exportAll(members: NonNullable<Member>[], groupId: number) {
    this.exported[groupId] = members;
  }
}

describe("ExportAllCommand", () => {
  const repository = new MockRepository([
    { id: 1, member_group_id: 5 },
    { id: 2, member_group_id: 5 },
    { id: 3, member_group_id: 5 },
    { id: 4, member_group_id: 5 },
    { id: 5, member_group_id: 5 },
    { id: 6, member_group_id: 6 },
    { id: 7, member_group_id: 7 },
  ]) as any;
  const api = new MockApi() as any;
  const command = new ExportAllCommand(repository, api);

  // it("exports all members", async () => {
  //   await command.run();
  //
  //   chai.expect(repository.called).to.equal(true);
  //   chai.expect(api.exported[1]).to.equal(undefined);
  //   chai.expect(api.exported[5].length).to.equal(5);
  //   chai.expect(api.exported[6].length).to.equal(1);
  //   chai.expect(api.exported[7].length).to.equal(1);
  // });

});
