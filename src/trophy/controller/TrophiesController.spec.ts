import { TrophiesController } from "./TrophiesController";
import { TrophyViewFactory } from "../TrophyViewFactory";
import * as chai from "chai";

const trophy1 = {
  id: 1,
  name: "Trophy 1",
  member_id: 1,
  member_group_id: 1,
  date_awarded: "2019-01-01",
  rewards: 100,
  carbon_saving: 10,
  miles: 10
};
const trophy2 = {
  id: 2,
  name: "Trophy 2",
  member_id: 2,
  member_group_id: 1,
  date_awarded: "2019-01-01",
  rewards: 100,
  carbon_saving: 10,
  miles: 10
};

class MockTrophyRepository {

  public async selectAll(): Promise<any[]> {
    return [trophy1, trophy2];
  }

  public async selectPaginated(page: number, quantity: number, filters: any[]): Promise<any> {
    return { rows: [trophy1, trophy2], pagination: { page, quantity, total: 2 } };
  }
}

describe("TrophiesController", () => {
  const controller = new TrophiesController(new MockTrophyRepository() as any, new TrophyViewFactory());
  const defaultContext = {
    request: {
      accept: {
        types: () => ["application/json"]
      }
    }
  };

  it("should return paginated trophies", async () => {
    const response = await controller.getAll({ page: "1", quantity: "10" }, defaultContext as any);

    chai.expect(response?.data.length).equal(2);
    chai.expect(response?.data[0].id).equal("/trophy/1");
  });

  it("should return trophies", async () => {
    const response = await controller.getAll({}, defaultContext as any);

    chai.expect(response?.data.length).equal(2);
    chai.expect(response?.data[0].id).equal("/trophy/1");
  });

  it("should return a CSV", async () => {
    const context = {
      request: {
        accept: {
          types: () => ["text/csv"]
        }
      },
      set: () => {},
      body: ""
    };

    await controller.getAll({}, context as any);
    const lines = context.body.split("\n");

    chai.expect(lines[0]).equal("trophy,member,date_awarded,group,rewards,carbon_saving,miles");
    chai.expect(lines[1]).equal("Trophy 1,0000000018,2019-01-01,1,100,10,10");
    chai.expect(lines[2]).equal("Trophy 2,0000000026,2019-01-01,1,100,10,10");
  });
});
