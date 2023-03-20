import * as chai from "chai";
import { TrophyRepository } from "./TrophyRepository";

describe("TrophyRepository", () => {

  it("selects all and replaces member ID with smartcard ID", async () => {
    const records = [];
    const db = new MockSelectDb(records);
    const repository = new TrophyRepository(db);
    await repository.selectAll();

    chai.expect(db.queries[0]).to.equal(`
      SELECT 
  trophy.*, 
  IFNULL(smartcard, member_id) AS member_id, 
  member_group.name AS member_group_id

      FROM trophy 
      
  JOIN member ON member.id = member_id 
  JOIN member_group ON member.member_group_id = member_group.id 

    `);
  });

  it("paginates", async () => {
    const db = new MockSelectDb([
      { sub_name: "subName1", date: "2020-01-01", total_distance: 1, total_rewards_earned: 1, total_carbon_saving: 1 },
      { sub_name: "subName1", date: "2020-01-06", total_distance: 1, total_rewards_earned: 1, total_carbon_saving: 1 },
      { sub_name: "subName1", date: "2020-01-07", total_distance: 1, total_rewards_earned: 1, total_carbon_saving: 1 },
      { sub_name: "subName2", date: "2020-01-01", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 },
      { sub_name: "subName2", date: "2020-01-01", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 },
      { sub_name: "subName2", date: "2020-01-05", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 },
      { sub_name: "subName2", date: "2020-01-07", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 }
    ]);
    const repository = new TrophyRepository(db);
    const index = await repository.selectPaginated(1, 3, [{ field: "sub_name", text: "subName1" }]);

    chai.expect(db.queries[0]).to.equal(`SELECT 
  trophy.*, 
  IFNULL(smartcard, member_id) AS member_id, 
  member_group.name AS member_group_id
 FROM trophy 
  JOIN member ON member.id = member_id 
  JOIN member_group ON member.member_group_id = member_group.id 
 WHERE ?? LIKE ? ORDER BY id DESC LIMIT 0, 3`);

  });

});

class MockSelectDb<T> {
  queries: any[] = [];
  throwError = false;

  constructor(
    private readonly results: T
  ) {}

  public async query(sql: string, callback?: any): Promise<[T]> {
    this.queries.push(sql);
    if (typeof callback === "function") {
      callback(this.throwError ? "Error" : null, this.results);
    }
    return [this.results];
  }
}
