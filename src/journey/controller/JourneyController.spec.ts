import * as chai from "chai";
import { JourneyCsvToMySqlStream } from "../JourneyCsvToMySqlStream";
import { JourneyController } from "./JourneyController";
import { Readable } from "stream";
import { JourneyFactory } from "../JourneyFactory";

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

describe("JourneyController", () => {
  const factory = new JourneyFactory({
    111222: {
      id: 111222,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 0,
      default_transport_mode: "",
      member_group_id: 1
    },
    2: {
      id: 2,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.57,
      default_transport_mode: "bus",
      member_group_id: 1
    }
  });

  const journeyRepository = new MockJourneyRepository();
  const badJourneyRepository = new MockExceptionJourneyRepository();

  it("handles post requests", async () => {
    const streamFactory = new MockFactory(new JourneyCsvToMySqlStream(factory, 1));
    const controller = new JourneyController(journeyRepository as any, streamFactory as any);
    const lines = [
      "3023110000000020,2019-12-09T15:10:05",
      null
    ];
    let i = 0;
    const input = new Readable({
      objectMode: true,
      read: function () {
        this.push(lines[i++]);
      }
    });

    const ctx = { adminUserId: 1, request: { body: input } };
    const result = await controller.post(input, ctx as any);

    chai.expect(result.data.errors).to.deep.equal([]);
    chai.expect(journeyRepository.records[0][0]).to.equal(null);
    chai.expect(journeyRepository.records[0][1]).to.equal(1);
    chai.expect(journeyRepository.records[0][3]).to.equal(null);
    chai.expect(journeyRepository.records[0][4]).to.equal("2019-12-09T15:10:05");
    chai.expect(journeyRepository.records[0][5]).to.equal(2);
    chai.expect(journeyRepository.records[0][6]).to.equal(1.57);
    chai.expect(journeyRepository.records[0][7]).to.equal("bus");
    chai.expect(journeyRepository.records[0][8]).to.equal(null);
    chai.expect(journeyRepository.records[0][9]).to.equal(null);
  });

  it("catches errors", async () => {
    const streamFactory = new MockFactory(new JourneyCsvToMySqlStream(factory, 1));
    const controller = new JourneyController(badJourneyRepository as any, streamFactory as any);
    const lines = [
      "3023110000000020,2019-12-09T15:10:05",
      null
    ];
    let i = 0;
    const input = new Readable({
      objectMode: true,
      read: function () {
        this.push(lines[i++]);
      }
    });

    const ctx = { adminUserId: 1, request: { body: input } };
    const result = await controller.post(input, ctx as any);

    chai.expect(result.data.errors).to.deep.equal(["Could not save to database"]);
  });

});
