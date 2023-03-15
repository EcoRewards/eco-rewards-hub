import * as chai from "chai";
import { TrophyAllocationJob } from "./TrophyAllocationJob";

class MockDb {
  public params: any[] = [];
  public throwUp = false;

  public async query(sql: string, params: any[]) {
    if (this.throwUp) {
      throw new Error("Mock error");
    }
    this.params.push(params);
  }
}

class MockLogger {
  public errors: any[] = [];

  public error(args: any) {
    this.errors.push(args);
  }
}

describe("TrophyAllocationJob", () => {
  const db = new MockDb();
  const logger = new MockLogger();
  const job = new TrophyAllocationJob(db as any, logger as any);

  it("runs against all trophies", async () => {
    await job.run();
    chai.expect(db.params).to.deep.equal([
      ["Bronze", 5000],
      ["Silver", 10000],
      ["Gold", 20000],
      ["Platinum", 50000],
      ["Sapphire", 70000],
      ["Ruby", 100000],
      ["Emerald", 150000],
      ["Diamond", 200000]
    ]);
  });

  it("logs errors", async () => {
    db.throwUp = true;
    await job.run();
    chai.expect(db.params).to.deep.equal([
      ["Bronze", 5000],
      ["Silver", 10000],
      ["Gold", 20000],
      ["Platinum", 50000],
      ["Sapphire", 70000],
      ["Ruby", 100000],
      ["Emerald", 150000],
      ["Diamond", 200000]
    ]);

    chai.expect(logger.errors).to.deep.equal([
      "Failed to allocate trophies",
      new Error("Mock error")
    ]);
  });

});
