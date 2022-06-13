import * as chai from "chai";
import { JourneyController } from "./JourneyController";
import { Readable } from "stream";
import { MemberModelFactory } from "../../member/MemberModelFactory";

class MockRepository {
  private i = 0;

  constructor(
    public records: any = [],
    public inserts: any = []
  ) { }

  async selectIn() {
    return this.records;
  }

  async save(row: any) {
    this.inserts.push(row);
    row.id = this.i++;

    return row;
  }

}

class MockMultiPartFileExtractor {

  constructor(
    private readonly form: any
  ) {}

  async getForm() {
    return this.form;
  }
}

describe("JourneyController", () => {
  const journeyRepository = new MockRepository() as any;
  const memberRepository = new MockRepository(
    [{
      id: 222223001,
      rewards: 0,
      carbon_saving: 0,
      default_distance: 1.0,
      default_transport_mode: "bus",
      member_group_id: 1,
      smartcard: null,
      total_miles: 4.2
    }],
  ) as any;
  const ctx = { req: {}, headers: { "content-type": "multipart/form-data"} };

  const mockStorage = async () => {};

  it("handles post requests", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({
        memberId: "2222230019",
        date: new Date().toJSON().substr(0, 10),
        mode: "bus",
        distance: 1.0
      }) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data).to.deep.equal("success");
    chai.expect(journeyRepository.inserts[0].member_id).to.equal(222223001);
    chai.expect(journeyRepository.inserts[0].device_id).to.equal("");
  });

  it("checks the form for errors", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({}) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data.errors[0]).to.deep.equal("Member ID must be set");
    chai.expect(result.data.errors[1]).to.deep.equal("Travel date must be set");
    chai.expect(result.data.errors[2]).to.deep.equal("Travel mode must be set");
    chai.expect(result.data.errors[3]).to.deep.equal("Travel distance must be set");
  });

  it("checks the travel date is within the last 7 days", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({
        memberId: "2222230019",
        date: "2000-01-01",
        mode: "bus",
        distance: 1.0
      }) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data.errors[0]).to.deep.equal("Travel date must be within the last 7 days");
  });

  it("checks the travel date is not in the future", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({
        memberId: "2222230019",
        date: "2999-01-01",
        mode: "bus",
        distance: 1.0
      }) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data.errors[0]).to.deep.equal("Travel date cannot be in the future");
  });

  it("checks the travel distance for bus", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({
        memberId: "2222230019",
        date: new Date().toJSON().substr(0, 10),
        mode: "bus",
        distance: 55
      }) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data.errors[0]).to.deep.equal("Travel distance must not exceed 50 miles or 500 miles for train journeys");
  });

  it("checks the travel distance for train", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({
        memberId: "2222230019",
        date: new Date().toJSON().substr(0, 10),
        mode: "train",
        distance: 555
      }) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data.errors[0]).to.deep.equal("Travel distance must not exceed 50 miles or 500 miles for train journeys");
  });

  it("checks the travel distance is not negative", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({
        memberId: "2222230019",
        date: new Date().toJSON().substr(0, 10),
        mode: "bus",
        distance: -5
      }) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data.errors[0]).to.deep.equal("Travel distance must not be negative");
  });

  it("uploads images", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({
        memberId: "2222230019",
        date: new Date().toJSON().substr(0, 10),
        mode: "bus",
        distance: 1.0,
        image: new Readable({
          read: () => {}
        })
      }) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data).to.deep.equal("success");
    chai.expect(journeyRepository.inserts[0].member_id).to.equal(222223001);
    chai.expect(journeyRepository.inserts[0].device_id).to.equal("");
  });

  it("ignores distance checks for journeys with a lat and long (QR scans)", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({
        memberId: "2222230019",
        date: new Date().toJSON().substr(0, 10),
        mode: "bus",
        distance: 55,
        deviceId: "12345"
      }) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const result = await controller.post({ }, ctx as any) as any;

    chai.expect(result.data.errors).to.equal(undefined);
  });

  it("accepts JSON requests", async () => {
    const controller = new JourneyController(
      memberRepository,
      journeyRepository,
      new MockMultiPartFileExtractor({}) as any,
      mockStorage,
      new MemberModelFactory(),
      { exportAll: () => {} } as any
    );

    const context = { req: {}, headers: { "content-type": "application/json" } };
    const result = await controller.post({
      memberId: "2222230019",
      date: new Date().toJSON().substr(0, 10),
      mode: "bus",
      distance: 55,
      deviceId: "12345"
    }, context as any) as any;

    chai.expect(result.data.errors).to.equal(undefined);
  });

});
