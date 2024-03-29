import * as chai from "chai";
import { Scheme } from "../../scheme/Scheme";
import { MembersController } from "./MembersController";
import { GroupView } from "../../group/GroupView";
import { OrganisationView } from "../../organisation/OrganisationView";
import { MemberView } from "../MemberView";
import { MemberModelFactory } from "../MemberModelFactory";
import { Member, MemberJsonView } from "../Member";
import { SchemeView } from "../../scheme/SchemeView";
import { GetAllResponse } from "../..";
import { TrophyView } from "../../trophy/TrophyView";

class MockOrganisationRepository {
  data: Scheme[] = [];

  public async insertAll(records: Member[]) {
    return records.map((record, i) => ({ ...record, id: i + 1 }));
  }

  public async updateRange() {

  }

  public async selectAll() {
    return [
      {
        id: 1,
        member_group_id: 2,
        carbon_saving: 4.3,
        rewards: 1700,
        default_distance: 5.4,
        default_transport_mode: "bus",
        smartcard: null,
        total_miles: 5.2
      },
      {
        id: 2,
        member_group_id: 2,
        carbon_saving: 4.3,
        rewards: 1700,
        default_distance: 5.4,
        default_transport_mode: "bus",
        smartcard: "6335970140550010",
        total_miles: 5.2
      },
      {
        id: 3,
        member_group_id: 2,
        carbon_saving: 4.3,
        rewards: 1700,
        default_distance: 5.4,
        default_transport_mode: "bus",
        smartcard: "633597014055001083",
        total_miles: 5.2
      },
    ];
  }
}

const trophyView = new TrophyView();
const trophy = {
  id: 1,
  name: "Trophy",
  member_id: 1,
  member_group_id: 1,
  date_awarded: "2018-01-01T00:00:00.000Z",
  rewards: 100,
  carbon_saving: 100,
  miles: 100
};

const groupView = new GroupView({
    1: { id: 1, name: "org1", scheme_id: 1 },
    2: { id: 2, name: "org2", scheme_id: 2 }
  },
  new OrganisationView({
    1: { id: 1, name: "scheme1", vac_client_id: 1 },
    2: { id: 2, name: "scheme2", vac_client_id: 1 }
  }, new SchemeView())
);

class MockFactory {
  public async create() {
    return new MemberView({
      1: { id: 1, name: "group1", organisation_id: 1 },
      2: { id: 2, name: "group2", organisation_id: 2 }
    }, {
      1: [trophy],
    },
    groupView,
    trophyView);
  }
}

class MockExternalApi {
  async exportAll() {

  }
}

describe("MembersController", () => {

  const controller = new MembersController(
    new MockOrganisationRepository() as any,
    new MockFactory() as any,
    new MemberModelFactory(),
    new MockExternalApi() as any
  );

  it("should create members", async () => {
    const result = await controller.post({
      quantity: 3,
      defaultDistance: 1,
      defaultTransportMode: "bus",
      group: "/group/2"
    });

    chai.expect(result.data.length).equal(3);
    chai.expect(result.data[0].defaultTransportMode).equal("bus");
    chai.expect(result.data[1].defaultTransportMode).equal("bus");
    chai.expect(result.data[2].defaultTransportMode).equal("bus");
    chai.expect(result.data[0].id).equal("/member/0000000018");
    chai.expect(result.data[1].id).equal("/member/0000000026");
    chai.expect(result.data[2].id).equal("/member/0000000034");
  });

  it("return members as json", async () => {
    const context = {
      request: {
        accept: {
          types: () => []
        }
      },
      set: () => {}
    };

    const result: GetAllResponse<MemberJsonView> = await controller.getAll({}, context as any) as any;

    chai.expect(result.data.length).equal(3);
    chai.expect(result.data[0].defaultTransportMode).equal("bus");
    chai.expect(result.data[1].defaultTransportMode).equal("bus");
    chai.expect(result.data[2].defaultTransportMode).equal("bus");
    chai.expect(result.data[0].id).equal("/member/0000000018");
    chai.expect(result.data[1].id).equal("/member/6335970140550010");
    chai.expect(result.data[2].id).equal("/member/633597014055001083");
  });

  it("return members as csv", async () => {
    const context = {
      body: "",
      request: {
        accept: {
          types: () => ["text/csv"]
        }
      },
      set: () => {}
    };

    await controller.getAll({}, context as any);

    const lines = context.body.split("\n");

    chai.expect(lines[0]).equal(
      "id,scheme,organisation,group,default_distance,default_transport_mode,previous_transport_mode," +
      "rewards,carbon_saving,total_miles"
    );
    chai.expect(lines[1]).equal("0000000018,scheme2,org2,group2,5.4,bus,,1700,4.3,5.2");
    chai.expect(lines[2]).equal("6335-9701-4055-0010,scheme2,org2,group2,5.4,bus,,1700,4.3,5.2");
    chai.expect(lines[3]).equal("633597-0140-5500-1083,scheme2,org2,group2,5.4,bus,,1700,4.3,5.2");
  });

  it("should update members", async () => {
    const result = await controller.patch({
      startId: "0000000018",
      endId: "0000000026",
      defaultDistance: 1,
      defaultTransportMode: "bus",
      group: "/group/2"
    });

    chai.expect(result.data).equal("OK");
  });

});
