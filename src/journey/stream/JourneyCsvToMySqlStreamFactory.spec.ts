import * as chai from "chai";
import { JourneyCsvToMySqlStreamFactory } from "./JourneyCsvToMySqlStreamFactory";

class MockDb {
  constructor(
    private readonly records: any
  ) {}

  public getIndexedById() {
    return this.records;
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
    const streamFactory = new JourneyCsvToMySqlStreamFactory(db as any);
    const result = await streamFactory.create(1);

    chai.expect(result.getErrors()).to.deep.equal([]);
  });

});
