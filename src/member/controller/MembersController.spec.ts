import * as chai from "chai";
import { Scheme } from "../../scheme/Scheme";
import { MembersController } from "./MembersController";
import { GroupView } from "../../group/GroupView";
import { OrganisationView } from "../../organisation/OrganisationView";
import { MemberView } from "../MemberView";
import { MemberModelFactory } from "../MemberModelFactory";
import { Member } from "../Member";

class MockOrganisationRepository {
  data: Scheme[] = [];

  public async insertAll(records: Member[]) {
    return records.map((record, i) => ({ ...record, id: i + 1 }));
  }

  public async selectOne(id: number) {
    return {
      1: { id: 1, default_transport_mode: "bus", default_distance: 0, member_group_id: 1, rewards: 0, carbon_saving: 0 }
    }[id];
  }
}

const groupView = new GroupView({
    1: { id: 1, name: "org1", scheme_id: 1 },
    2: { id: 2, name: "org2", scheme_id: 2 }
  },
  new OrganisationView({
    1: { id: 1, name: "scheme1" },
    2: { id: 2, name: "scheme2" }
  })
);

class MockFactory {
  public async create() {
    return new MemberView({
      1: { id: 1, name: "group1", organisation_id: 1 },
      2: { id: 2, name: "group2", organisation_id: 2 }
    }, groupView);
  }
}

describe("MembersController", () => {

  const controller = new MembersController(
    new MockOrganisationRepository() as any,
    new MockFactory() as any,
    new MemberModelFactory()
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
    chai.expect(result.data[0].id).equal("/member/3023110000000012");
    chai.expect(result.data[1].id).equal("/member/3023110000000020");
    chai.expect(result.data[2].id).equal("/member/3023110000000038");
  });

  it("return a single result", async () => {
    const result = await controller.get({ id: "3023110000000012" });
    const expected = {
      carbonSaving: 0,
      defaultDistance: 0,
      defaultTransportMode: "bus",
      group: "/group/1",
      id: "/member/3023110000000012",
      rewards: 0
    };

    chai.expect(result.data).to.deep.equal(expected);
  });

  it("return a 404 if the record does not exist", async () => {
    const result = await controller.get({ id: "3023110000000020" });

    chai.expect(result.code).to.deep.equal(404);
  });

});
