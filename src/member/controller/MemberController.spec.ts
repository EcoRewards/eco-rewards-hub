import * as chai from "chai";
import { Scheme } from "../../scheme/Scheme";
import { GroupView } from "../../group/GroupView";
import { OrganisationView } from "../../organisation/OrganisationView";
import { MemberView } from "../MemberView";
import { Member } from "../Member";
import { MemberController } from "./MemberController";
import { MemberModelFactory } from "../MemberModelFactory";
import { SchemeView } from "../../scheme/SchemeView";

class MockMemberRepository {
  data: Scheme[] = [];

  public async selectBySmartcard(id: string) {
    return {
      "654321002222230099": {
        id: 2,
        default_transport_mode: "bus",
        default_distance: 0,
        member_group_id: 1,
        rewards: 0,
        carbon_saving: 0,
        smartcard: "654321002222230099",
        total_miles: 4.2
      }
    }[id];
  }

}

class MockRepository {

  public async save(record: Member) {
    return { ...record, id: 1 };
  }

  public async selectOne(id: number) {
    return {
      1: {
        id: 1,
        default_transport_mode: "bus",
        default_distance: 0,
        member_group_id: 1,
        rewards: 0,
        carbon_saving: 0,
        total_miles: 5
      }
    }[id];
  }

}

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
    }, groupView);
  }
}

class MockExternalApi {
  async exportAll() {

  }
}

describe("MemberController", () => {

  const controller = new MemberController(
    new MockMemberRepository() as any,
    new MockRepository() as any,
    new MockFactory() as any,
    new MemberModelFactory(),
    new MockExternalApi() as any
  );

  it("should create a member", async () => {
    const result = await controller.post({
      smartcard: "654321002222230099",
      defaultDistance: 1,
      defaultTransportMode: "bus",
      group: "/group/2"
    });

    chai.expect(result.data.id).equal("/member/654321002222230099");
  });

  it("should update a member", async () => {
    const result = await controller.put({
      id: "0000000018",
      defaultDistance: 10,
      defaultTransportMode: "train"
    });

    const expected = {
      carbonSaving: 0,
      defaultDistance: 10,
      defaultTransportMode: "train",
      group: "/group/1",
      id: "/member/0000000018",
      rewards: 0,
      totalMiles: 5
    };

    chai.expect(result.code).equal(200);
    chai.expect(result.data).to.deep.equal(expected);
  });

  it("should return a 404 if a member can't be found", async () => {
    const result = await controller.put({
      id: "0000000026",
      defaultDistance: 10,
      defaultTransportMode: "train"
    });

    chai.expect(result.code).equal(404);
  });

  it("return a result by id", async () => {
    const result = await controller.get({ id: "0000000018" });
    const expected = {
      carbonSaving: 0,
      defaultDistance: 0,
      defaultTransportMode: "bus",
      group: "/group/1",
      id: "/member/0000000018",
      rewards: 0,
      totalMiles: 5
    };

    chai.expect(result.data).to.deep.equal(expected);
  });

  it("return a result by smartcard", async () => {
    const result = await controller.get({ id: "654321002222230099" });
    const expected = {
      carbonSaving: 0,
      defaultDistance: 0,
      defaultTransportMode: "bus",
      group: "/group/1",
      id: "/member/654321002222230099",
      rewards: 0,
      totalMiles: 4.2
    };

    chai.expect(result.data).to.deep.equal(expected);
  });

  it("return a 404 if the record does not exist", async () => {
    const result = await controller.get({ id: "0000000026" });

    chai.expect(result.code).to.deep.equal(404);
  });

});
