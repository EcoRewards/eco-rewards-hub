import * as chai from "chai";
import { JourneyCsvToMySqlStream } from "../stream/JourneyCsvToMySqlStream";
import { JourneysController } from "./JourneysController";
import { Readable } from "stream";
import { JourneyFactory } from "../JourneyFactory";
import { JourneyViewFactory } from "../JourneyViewFactory";
import { LocalDate } from "@js-joda/core";

class MockFactory {
  constructor(
    private readonly value: JourneyCsvToMySqlStream
  ) {}

  create() {
    return this.value;
  }
}

const today = LocalDate.now().toJSON();
const todayMinus1 = LocalDate.now().minusDays(1).toJSON();
const todayMinus2 = LocalDate.now().minusDays(2).toJSON();
const todayMinus3 = LocalDate.now().minusDays(3).toJSON();
const todayMinus4 = LocalDate.now().minusDays(4).toJSON();

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

  public async selectJourneysGroupedByTravelDate() {
    return {
      subName1: {
        [today]: {
          sub_name: "subName1",
          date: today,
          total_distance: 1,
          total_rewards_earned: 1,
          total_carbon_saving: 1
        },
        [todayMinus1]: {
          sub_name: "subName1",
          date: todayMinus1,
          total_distance: 1,
          total_rewards_earned: 1,
          total_carbon_saving: 1
        },
        [todayMinus3]: {
          sub_name: "subName1",
          date: todayMinus3,
          total_distance: 1,
          total_rewards_earned: 1,
          total_carbon_saving: 1
        },
      },
      subName2: {
        [today]: {
          sub_name: "subName2",
          date: today,
          total_distance: 2,
          total_rewards_earned: 2,
          total_carbon_saving: 2
        },
        [todayMinus4]: {
          sub_name: "subName2",
          date: todayMinus4,
          total_distance: 2,
          total_rewards_earned: 2,
          total_carbon_saving: 2
        },
        [todayMinus3]: {
          sub_name: "subName2",
          date: todayMinus3,
          total_distance: 2,
          total_rewards_earned: 2,
          total_carbon_saving: 2
        }
      }
    };
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

  async getForm() {
    const lines = [
      "0000000026,2019-12-09T15:10:05",
      null
    ];
    let i = 0;
    return {
      file: new Readable({
        objectMode: true,
        read: function () {
          this.push(lines[i++]);
        }
      })
    };
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
      total_miles: 5.0,
      previous_transport_mode: null
    },
    2: {
      id: 2,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.57,
      default_transport_mode: "bus",
      member_group_id: 1,
      smartcard: null,
      total_miles: 10,
      previous_transport_mode: null
    }
  }, {}, {} as any, {} as any);

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

  it("returns a report", async () => {
    const controller = new JourneysController(
      journeyRepository as any,
      {} as any,
      {} as any,
      {} as any
    );
    const { data }: any = await controller.getReport({ type: "global", id: "0" });

    chai.expect(data.length).to.deep.equal(16);
  });

});
