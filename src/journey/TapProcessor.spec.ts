import * as chai from "chai";
import { TapProcessor } from "./TapProcessor";
import { MemberModelFactory } from "../member/MemberModelFactory";

class MockRepository {
  private i = 1;

  constructor(
    public records: any = {},
    public inserts: any = []
  ) { }

  async selectIn() {
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

class MockLogger {
  public warnings: string[] = [];

  warn(message: string) {
    this.warnings.push(message);
  }
}

describe("TapProcessor", () => {
  const journeyRepository = new MockRepository() as any;
  const memberRepository = new MockRepository([
    {
      id: 222223001,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.0,
      default_transport_mode: "bus",
      member_group_id: 1,
      smartcard: null,
      total_miles: 4.2
    },
  ]) as any;

  const memberFactory = new MemberModelFactory();
  const externalMemberRepository = new MockExternalApi() as any;
  const logger = new MockLogger();
  const processor = new TapProcessor(
    journeyRepository, memberRepository, memberFactory, externalMemberRepository, logger as any
  );

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

    logger.warnings = [];

    const journeys = await processor.getJourneys(taps, "123123", 1);

    chai.expect(journeys.length).to.equal(0);
    chai.expect(logger.warnings[0]).to.equal(
      "Discarded tap from device 123123: Cannot find member: 1338000012345678"
    );
  });

  it("keeps the rest of the batch when one tap cannot be processed", async () => {
    const taps = {
      "2222230019": "2020-06-02",
      "1338000012345678": "2020-06-02"
    };

    logger.warnings = [];

    const journeys = await processor.getJourneys(taps, "123123", 1);

    chai.expect(journeys.length).to.equal(1);
    chai.expect(journeys[0].member_id).to.equal(222223001);
    chai.expect(logger.warnings.length).to.equal(1);
  });

});
