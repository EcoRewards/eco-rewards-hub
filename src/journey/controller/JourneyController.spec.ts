import * as chai from "chai";
import { JourneyCsvToMySqlStream } from "../stream/JourneyCsvToMySqlStream";
import { JourneysController } from "./JourneysController";
import { Readable } from "stream";
import { JourneyFactory } from "../JourneyFactory";
import { JourneyViewFactory } from "../JourneyViewFactory";
import { JourneyController } from "./JourneyController";
import { TapReader } from "../TapReader";

class MockRepository {

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

}

class MockTapReader {
  getTaps() {
    return {
      "2222230019": "2020-01-15T20:30"
    };
  }
}

describe("JourneyController", () => {
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
    },
  }) as any;

  const adminRepository = new MockRepository({
    1: { name: "Test "}
  }) as any;

  const reader = new MockTapReader() as any;
  const journeyViewFactory = new JourneyViewFactory(adminRepository, memberRepository);

  it("handles post requests", async () => {
    const controller = new JourneyController(
      reader,
      journeyViewFactory,
      journeyRepository,
      memberRepository
    );

    const ctx = { adminUserId: 1, req: {} };
    const request = {
      "payload_raw": "BREYcAAAABJMYzgAAIU1FQEHv4BOIiIjABMHv4BOIiIjABIHv4E="
    };
    const result = await controller.post(request, ctx as any);

    chai.expect(result.data[0].member).to.deep.equal("/member/2222230019");
    chai.expect(journeyRepository.inserts[0].member_id).to.equal(222223001);
  });

});
