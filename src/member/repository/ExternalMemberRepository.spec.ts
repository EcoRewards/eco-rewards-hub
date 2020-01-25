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

describe("ExternalMemberRepository", () => {
  const api = new MockApi() as any;
  const logger = new MockLogger() as any;

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
        total_miles: 90
      },
      {
        id: 2,
        member_group_id: 1,
        rewards: 0,
        carbon_saving: 0,
        default_transport_mode: "bus",
        default_distance: 4.2,
        smartcard: "1234567890123456",
        total_miles: 50
      }
    ];
    const repository = new ExternalMemberRepository(api, logger);
    await repository.exportAll(records);

    chai.expect(api.members[0].employeeid).to.equal("0000000018");
    chai.expect(api.members[1].employeeid).to.equal("1234567890123456");
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
        total_miles: 5.5
      }
    ];
    api.exception = "fail";
    const repository = new ExternalMemberRepository(api, logger);
    await repository.exportAll(records);

    chai.expect(logger.err).to.equal("fail");
  });

});
