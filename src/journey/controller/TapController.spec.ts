import * as chai from "chai";
import { JourneyViewFactory } from "../JourneyViewFactory";
import { TapController } from "./TapController";
import btoa = require("btoa");
import { TapProcessor } from "../TapProcessor";
import { MemberModelFactory } from "../../member/MemberModelFactory";

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

class MockHttp {
  url?: string;
  data?: any;

  post(url: string, data: any) {
    this.url = url;
    this.data = data;
  }
}

class MockExternalApi {
  async exportAll() {

  }
}

describe("TapController", () => {
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

  const adminRepository = new MockRepository({
    1: { name: "Test "}
  }) as any;

  const reader = new MockTapReader() as any;
  const journeyViewFactory = new JourneyViewFactory(adminRepository);
  const memberFactory = new MemberModelFactory();
  const externalMemberRepository = new MockExternalApi() as any;

  it("handles post requests", async () => {
    const controller = new TapController(
      new TapProcessor(reader, journeyRepository, memberRepository, memberFactory, externalMemberRepository),
      journeyViewFactory,
      {} as any,
      {} as any,
      { info: () => {} } as any,
    );

    const ctx = { adminUserId: 1, req: {} };
    const request = {
      "dev_id": "1",
      "port": 1,
      "downlink_url": "",
      "payload_raw": "BREYcAAAABJMYzgAAIU1FQEHv4BOIiIjABMHv4BOIiIjABIHv4E="
    };
    const result = await controller.post(request, ctx as any);

    chai.expect(result.data[0].memberId).to.deep.equal("/member/2222230019");
    chai.expect(journeyRepository.inserts[0].member_id).to.equal(222223001);
    chai.expect(journeyRepository.inserts[0].device_id).to.equal("05111870");
  });

  it("handles status requests", async () => {
    const mockHttp = new MockHttp();
    const controller = new TapController(
      {} as any,
      {} as any,
      {} as any,
      mockHttp as any,
      { info: () => {}, warn: () => {} } as any
    );

    const ctx = { adminUserId: 1, req: {} };
    const request = {
      "dev_id": "1",
      "port": 1,
      "downlink_url": "http://example.org",
      "payload_raw": btoa(Buffer.from("0412885000000401202001181616000015703752000400000000", "hex"))
    };

    await controller.post(request, ctx as any);

    chai.expect(mockHttp.url).to.equal("http://example.org");
    chai.expect(mockHttp.data.dev_id).to.equal("1");
    chai.expect(mockHttp.data.port).to.equal(2);
  });

});
