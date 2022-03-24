import * as chai from "chai";
import { JourneyCsvToMySqlStreamFactory } from "./JourneyCsvToMySqlStreamFactory";
import { MemberModelFactory } from "../../member/MemberModelFactory";
import { Member } from "../../member/Member";

class MockDb {
  constructor(
    private readonly records: any
  ) {}

  public getIndexedById() {
    return this.records;
  }
}

class MockRepository {
  public ids = 1;
  public async save(member: Member) {
    member.id = this.ids++;

    return member;
  }
}

describe("JourneyCsvToMySqlStreamFactory", () => {
  const db = new MockDb({
    111222: {
      id: 111222,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 0,
      default_transport_mode: "",
      member_group_id: 1
    }
  });

  it("gets members", async () => {
    const streamFactory = new JourneyCsvToMySqlStreamFactory(
      db as any,
      new MockRepository() as any,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );
    const result = await streamFactory.create(1);

    chai.expect(result.getErrors()).to.deep.equal([]);
  });

});
