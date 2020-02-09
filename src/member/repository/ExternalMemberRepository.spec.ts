import * as chai from "chai";
import { ExternalMemberRepository } from "./ExternalMemberRepository";

class MockApi {
  members?: any[];
  exception?: string;

  async post(endpoint: string, members: any[]) {
    if (this.exception) {
      throw this.exception;
    }
    this.members = members;
  }
}

class MockLogger {
  err?: string;

  error(e: any) {
    this.err = e;
  }

}

class MockDb {
  result = { vac_client_id: 155 };

  public async query() {
    return [[this.result]];
  }
}

describe("ExternalMemberRepository", () => {
  const api = new MockApi() as any;
  const logger = new MockLogger() as any;
  const db = new MockDb() as any;

  it("converts before exporting", async () => {
    const records = [
      {
        id: 1,
        member_group_id: 1,
        rewards: 0,
        carbon_saving: 0,
        default_transport_mode: "bus",
        default_distance: 4.2,
        smartcard: null,
        total_miles: 90,
        previous_transport_mode: null
      },
      {
        id: 2,
        member_group_id: 1,
        rewards: 0,
        carbon_saving: 0,
        default_transport_mode: "bus",
        default_distance: 4.2,
        smartcard: "1234567890123456",
        total_miles: 50,
        previous_transport_mode: null
      }
    ];
    const repository = new ExternalMemberRepository(api, db, logger);
    await repository.exportAll(records, 5);

    chai.expect(api.members[0].employeeid).to.equal("0000000018");
    chai.expect(api.members[1].employeeid).to.equal("1234567890123456");
  });

  it("defaults to clientid to 0", async () => {
    const records = [
      {
        id: 1,
        member_group_id: 1,
        rewards: 0,
        carbon_saving: 0,
        default_transport_mode: "bus",
        default_distance: 4.2,
        smartcard: null,
        total_miles: 90,
        previous_transport_mode: null
      }
    ];
    db.result = undefined;

    const repository = new ExternalMemberRepository(api, db, logger);
    await repository.exportAll(records, 5);

    chai.expect(api.members[0].clientid).to.equal("0");
  });

  it("logs exceptions", async () => {
    const records = [
      {
        id: 1,
        member_group_id: 1,
        rewards: 0,
        carbon_saving: 0,
        default_transport_mode: "bus",
        default_distance: 4.2,
        smartcard: null,
        total_miles: 5.5,
        previous_transport_mode: null
      }
    ];
    api.exception = "fail";
    const repository = new ExternalMemberRepository(api, db, logger);
    await repository.exportAll(records, 5);

    chai.expect(logger.err).to.equal("fail");
  });

});
