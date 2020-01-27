import * as chai from "chai";
import { JourneyCsvToMySqlStream } from "../stream/JourneyCsvToMySqlStream";
import { JourneysController } from "./JourneysController";
import { Readable } from "stream";
import { JourneyFactory } from "../JourneyFactory";
import { JourneyViewFactory } from "../JourneyViewFactory";

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

  async selectAll() {
    return [
      {
        id: 1,
        admin_user_id: 1,
        uploaded: "2019-12-11T22:04:50",
        processed: null,
        travel_date: "2019-12-11T10:02:20",
        member_id: 1,
        distance: 1.56,
        mode: "Train",
        rewards_earned: null,
        carbon_saving: null,
        device_id: null
      },
      {
        id: 2,
        admin_user_id: 1,
        uploaded: "2019-12-11T22:04:50",
        processed: null,
        travel_date: "2019-12-11T10:02:20",
        member_id: "654321002222230099",
        distance: 1.56,
        mode: "Train",
        rewards_earned: null,
        carbon_saving: null,
        device_id: null
      }
    ];
  }
}

class MockRepository {

  async getIndexedById() {
    return {
      1: {
        name: "Bob"
      }
    };
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

describe("JourneysController", () => {
  const factory = new JourneyFactory({
    111222: {
      id: 111222,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 0,
      default_transport_mode: "",
      member_group_id: 1,
      smartcard: null,
      total_miles: 5.0
    },
    2: {
      id: 2,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.57,
      default_transport_mode: "bus",
      member_group_id: 1,
      smartcard: null,
      total_miles: 10
    }
  }, {});

  const journeyRepository = new MockJourneyRepository();
  const badJourneyRepository = new MockExceptionJourneyRepository();
  const multiPartFileExtractor = new MockMultiPartFileExtractor();

  it("handles post requests", async () => {
    const streamFactory = new MockFactory(new JourneyCsvToMySqlStream(factory, 1));
    const controller = new JourneysController(
      journeyRepository as any,
      streamFactory as any,
      multiPartFileExtractor as any,
      {} as any
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
    chai.expect(values[9]).to.equal("");
    chai.expect(values[10]).to.equal("\n");
  });

  it("catches errors", async () => {
    const streamFactory = new MockFactory(new JourneyCsvToMySqlStream(factory, 1));
    const controller = new JourneysController(
      badJourneyRepository as any,
      streamFactory as any,
      multiPartFileExtractor as any,
      {} as any
    );

    const ctx = { adminUserId: 1, req: {} };
    const result = await controller.post({}, ctx as any);

    chai.expect(result.data.errors).to.deep.equal(["Could not save to database"]);
  });

  it("returns all results", async () => {
    const controller = new JourneysController(
      journeyRepository as any,
      {} as any,
      multiPartFileExtractor as any,
      new JourneyViewFactory(new MockRepository() as any)
    );
    const result = await controller.getAll();
    const expected = [
      {
        "carbonSaving": null,
        "distance": 1.56,
        "memberId": "/member/0000000018",
        "mode": "Train",
        "processed": null,
        "rewardsEarned": null,
        "source": "Bob",
        "travelDate": "2019-12-11T10:02:20",
        "uploaded": "2019-12-11T22:04:50",
        "deviceId": null
      },
      {
        "carbonSaving": null,
        "distance": 1.56,
        "memberId": "/member/654321002222230099",
        "mode": "Train",
        "processed": null,
        "rewardsEarned": null,
        "source": "Bob",
        "travelDate": "2019-12-11T10:02:20",
        "uploaded": "2019-12-11T22:04:50",
        "deviceId": null
      }
    ];

    chai.expect(result.data).to.deep.equal(expected);
  });

});
