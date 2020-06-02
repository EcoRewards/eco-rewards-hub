import * as chai from "chai";
import { TapProcessor } from "./TapProcessor";
import { MemberModelFactory } from "../member/MemberModelFactory";

class MockRepository {
  private i = 1;

  constructor(
    public records: any = {},
    public inserts: any = []
  ) { }

  async getIndexedById() {
    return this.records;
  }

  async insertAll(rows: any) {
    this.inserts = rows;

    return rows.map((row, i) => ({ id: i, ...row }));
  }

  async save(row: any) {
    row.id = this.i++;

    return row;
  }
}

class MockExternalApi {
  async exportAll() {

  }
}

describe("TapProcessor", () => {
  const journeyRepository = new MockRepository() as any;
  const memberRepository = new MockRepository({
    "222223001": {
      id: 222223001,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.0,
      default_transport_mode: "bus",
      member_group_id: 1,
      smartcard: null,
      total_miles: 4.2
    },
  }) as any;

  const memberFactory = new MemberModelFactory();
  const externalMemberRepository = new MockExternalApi() as any;
  const processor = new TapProcessor(journeyRepository, memberRepository, memberFactory, externalMemberRepository);

  it("creates journeys", async () => {
    const taps = {
      "2222230019": "2020-06-02"
    };

    const [journey] = await processor.getJourneys(taps, "123123", 1);

    chai.expect(journey.member_id).to.equal(222223001);
    chai.expect(journey.travel_date).to.equal("2020-06-02");
  });

  it("creates members that don't exist", async () => {
    const taps = {
      "6338000012345678": "2020-06-02",
      "6335970112345678": "2020-06-02",
    };

    const [journey1, journey2] = await processor.getJourneys(taps, "123123", 1);

    chai.expect(journey1.member_id).to.equal(1);
    chai.expect(journey2.member_id).to.equal(2);
  });

  it("doesn't create members from unknown IINs", async () => {
    const taps = {
      "1338000012345678": "2020-06-02",
    };

    try {
      await processor.getJourneys(taps, "123123", 1);
      chai.expect(false).to.equal(true);
    }
    catch (e) {
      chai.expect(e.message).to.equal("Cannot find member: 1338000012345678");
    }
  });

});
