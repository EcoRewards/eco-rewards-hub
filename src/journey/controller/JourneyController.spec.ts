import * as chai from "chai";
import { JourneyCsvToMySqlStream } from "../stream/JourneyCsvToMySqlStream";
import { JourneyController } from "./JourneyController";
import { Readable } from "stream";
import { JourneyFactory } from "../JourneyFactory";
import { MultiPartFileExtractor } from "./MultiPartFileExtractor";

class MockFactory {
  constructor(
    private readonly value: JourneyCsvToMySqlStream
  ) {}

  create() {
    return this.value;
  }
}

class MockJourneyRepository {
  records: any[] = [];

  insertStream(input: Readable) {
    input.on("data", row => this.records.push(row));

    return new Promise(r => input.on("end", r));
  }
}

class MockExceptionJourneyRepository {

  async insertStream(input: Readable) {
    throw Error("Could not save to database");
  }
}

class MockMultiPartFileExtractor {

  async getFile() {
    const lines = [
      "0000000026,2019-12-09T15:10:05",
      null
    ];
    let i = 0;
    return new Readable({
      objectMode: true,
      read: function () {
        this.push(lines[i++]);
      }
    });

  }
}

describe("JourneyController", () => {
  const factory = new JourneyFactory({
    111222: {
      id: 111222,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 0,
      default_transport_mode: "",
      member_group_id: 1,
      smartcard: null,
    },
    2: {
      id: 2,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.57,
      default_transport_mode: "bus",
      member_group_id: 1,
      smartcard: null
    }
  }, {});

  const journeyRepository = new MockJourneyRepository();
  const badJourneyRepository = new MockExceptionJourneyRepository();
  const multiPartFileExtractor = new MockMultiPartFileExtractor();

  it("handles post requests", async () => {
    const streamFactory = new MockFactory(new JourneyCsvToMySqlStream(factory, 1));
    const controller = new JourneyController(
      journeyRepository as any,
      streamFactory as any,
      multiPartFileExtractor as any
    );

    const ctx = { adminUserId: 1, req: {} };
    const result = await controller.post({}, ctx as any);
    const values = journeyRepository.records[0].toString().split(",");

    chai.expect(result.data.errors).to.deep.equal([]);
    chai.expect(values[0]).to.equal("");
    chai.expect(values[1]).to.equal("1");
    chai.expect(values[3]).to.equal("");
    chai.expect(values[4]).to.equal("2019-12-09T15:10:05");
    chai.expect(values[5]).to.equal("2");
    chai.expect(values[6]).to.equal("1.57");
    chai.expect(values[7]).to.equal("bus");
    chai.expect(values[8]).to.equal("");
    chai.expect(values[9]).to.equal("\n");
  });

  it("catches errors", async () => {
    const streamFactory = new MockFactory(new JourneyCsvToMySqlStream(factory, 1));
    const controller = new JourneyController(
      badJourneyRepository as any,
      streamFactory as any,
      multiPartFileExtractor as any
    );

    const ctx = { adminUserId: 1, req: {} };
    const result = await controller.post({}, ctx as any);

    chai.expect(result.data.errors).to.deep.equal(["Could not save to database"]);
  });

});
