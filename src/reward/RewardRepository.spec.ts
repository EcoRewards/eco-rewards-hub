import * as chai from "chai";
import { RewardRepository } from "./RewardRepository";

describe("RewardRepository", () => {
  const logger = { warn: () => {} } as any;

  it("selects a members processed points", async () => {
    const db = new MockDb();
    const repository = new RewardRepository(db, logger);
    await repository.selectMemberRewardsGeneratedOn(1, "2020-01-27");

    const sql = db.sqlQueries[0];

    chai.expect(sql).to.equal(
      `SELECT 
        SUM(rewards_earned) AS amount,
        GROUP_CONCAT(IF(device_id="", "none", device_id)) AS devices
       FROM journey 
       WHERE member_id = ? 
       AND processed IS NOT NULL
       AND DATE(travel_date) = ?`
    );
  });

  it("selects unprocessed journeys", async () => {
    const db = new MockSelectDb([
      { id: 1, member_id: 1, travel_date: "2020-01-27" },
      { id: 2, member_id: 1, travel_date: "2020-01-27" },
    ]);
    const repository = new RewardRepository(db, logger);
    const results = await repository.selectUnprocessedJourneysIndexedByMemberAndDate();

    chai.expect(results).to.deep.equal({
      1: {
        "2020-01-27": [
          { id: 1, member_id: 1, travel_date: "2020-01-27" },
          { id: 2, member_id: 1, travel_date: "2020-01-27" },
        ]
      }
    });

  });

  it("rolls back a transaction of the delete fails", async () => {
    const db = new MockDb();
    db.shouldError = true;

    const repository = new RewardRepository(db, logger);
    await repository.updateRewards(1, [], 50, 1, 1);

    chai.expect(db.transaction).to.equal(true);
    chai.expect(db.transactionAborted).to.equal(true);
    chai.expect(db.transactionCommitted).to.equal(false);
    chai.expect(db.connectionReleased).to.equal(true);
  });

  it("cleans up relationships", async () => {
    const db = new MockDb();
    const repository = new RewardRepository(db, logger);
    await repository.updateRewards(1, [[1, 1, 1]], 50, 1, 1);

    const [sql] = db.sqlQueries;

    chai.expect(sql).to.equal(`UPDATE member SET 
           rewards = rewards + ?, 
           carbon_saving = carbon_saving + ?,
           total_miles = total_miles + ?
         WHERE id = ?`);
    chai.expect(db.transaction).to.equal(true);
    chai.expect(db.transactionAborted).to.equal(false);
    chai.expect(db.transactionCommitted).to.equal(true);
    chai.expect(db.connectionReleased).to.equal(true);
  });

});

class MockDb {
  public sqlQueries: string[] = [];
  public transaction = false;
  public transactionCommitted = false;
  public transactionAborted = false;
  public connectionReleased = false;
  public shouldError = false;

  public async query(sql: string, values: any[]): Promise<[QueryResult]> {
    if (this.shouldError) {
      throw new Error("DB query failed.");
    }

    this.sqlQueries.push(sql);

    return [{ insertId: 1 }];
  }

  public async getConnection() {
    return this;
  }

  public async beginTransaction() {
    this.transaction = true;
  }

  public async commit() {
    this.transactionCommitted = true;
  }

  public async rollback() {
    this.transactionAborted = true;
  }

  public async release() {
    this.connectionReleased = true;
  }

}

class MockSelectDb<T> {

  constructor(
    private readonly results: T
  ) {}

  public async query(sql: string, values: any[]): Promise<[T]> {
    return [this.results];
  }
}

interface QueryResult {
  insertId: number;
}
