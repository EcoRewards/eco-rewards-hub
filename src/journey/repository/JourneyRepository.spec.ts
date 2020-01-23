import * as chai from "chai";
import { JourneyRepository } from "./JourneyRepository";
import { Readable } from "stream";

describe("JourneyRepository", () => {

  it("selects all and replaces member ID with smartcard ID", async () => {
    const records = [];
    const db = new MockSelectDb(records);
    const repository = new JourneyRepository(db, db);
    await repository.selectAll();

    chai.expect(db.queries[0]).to.equal(`
      SELECT journey.*, IFNULL(smartcard, member_id) AS member_id 
      FROM journey JOIN member ON member.id = member_id 
      ORDER BY journey.id DESC 
      LIMIT 10000
    `);
  });

  it("inserts a stream", async () => {
    const records = [];
    const db = new MockSelectDb(records);
    const repository = new JourneyRepository(db, db);
    const stream = new Readable();
    await repository.insertStream(stream);

    chai.expect(db.queries[0].sql).to.equal(`
      LOAD DATA LOCAL INFILE 'stream' 
      INTO TABLE journey 
      FIELDS TERMINATED BY ','
      (
        @id,
        @admin_user_id,
        @uploaded,
        @processed,
        @travel_date,
        @member_id,
        @distance,
        @mode,
        @rewards_earned,
        @carbon_saving
      )
      SET
        id = null,
        admin_user_id = nullif(@admin_user_id, ''),
        uploaded = nullif(@uploaded, ''),
        processed = nullif(@processed, ''),
        travel_date = nullif(@travel_date, ''),
        member_id = nullif(@member_id, ''),
        distance = nullif(@distance, ''),
        mode = nullif(@mode, ''),
        rewards_earned = nullif(@rewards_earned, ''),
        carbon_saving = nullif(@carbon_saving, '')
    `);
  });

  it("returns errors", async () => {
    const records = [];
    const db = new MockSelectDb(records);
    db.throwError = true;
    const repository = new JourneyRepository(db, db);
    const stream = new Readable();
    const result = await repository.insertStream(stream).then(null, err => err);

    chai.expect(result).to.equal("Error");
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
    if (callback) {
      callback(this.throwError ? "Error" : null, this.results);
    }
    return [this.results];
  }
}
