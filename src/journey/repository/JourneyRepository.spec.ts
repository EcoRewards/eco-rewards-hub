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

  it("selects journey data for a global report", async () => {
    const db = new MockSelectDb([]);
    const repository = new JourneyRepository(db, db);
    await repository.selectJourneysGroupedByTravelDate("2020-01-01", "2020-01-31", "global");

    chai.expect(db.queries[0]).to.equal(`
      SELECT
        scheme.name as sub_name,
        DATE(travel_date) as date,
        SUM(journey.distance) AS total_distance,
        SUM(journey.rewards_earned) AS total_rewards_earned,
        SUM(journey.carbon_saving) AS total_carbon_saving
      FROM member
      JOIN member_group on member_group.id = member_group_id
      JOIN organisation on organisation.id = organisation_id
      JOIN scheme on scheme.id = scheme_id
      JOIN journey on member.id = member_id
      WHERE travel_date BETWEEN ? AND ? 
      GROUP BY CONCAT(sub_name, DATE(travel_date));
    `);
  });

  it("selects journey data for a scheme report", async () => {
    const db = new MockSelectDb([
      { sub_name: "subName1", date: "2020-01-01", total_distance: 1, total_rewards_earned: 1, total_carbon_saving: 1 },
      { sub_name: "subName1", date: "2020-01-06", total_distance: 1, total_rewards_earned: 1, total_carbon_saving: 1 },
      { sub_name: "subName1", date: "2020-01-07", total_distance: 1, total_rewards_earned: 1, total_carbon_saving: 1 },
      { sub_name: "subName2", date: "2020-01-01", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 },
      { sub_name: "subName2", date: "2020-01-01", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 },
      { sub_name: "subName2", date: "2020-01-05", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 },
      { sub_name: "subName2", date: "2020-01-07", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 }
    ]);
    const repository = new JourneyRepository(db, db);
    const index = await repository.selectJourneysGroupedByTravelDate("2020-01-01", "2020-01-31", "scheme", 1);

    chai.expect(db.queries[0]).to.equal(`
      SELECT
        organisation.name as sub_name,
        DATE(travel_date) as date,
        SUM(journey.distance) AS total_distance,
        SUM(journey.rewards_earned) AS total_rewards_earned,
        SUM(journey.carbon_saving) AS total_carbon_saving
      FROM member
      JOIN member_group on member_group.id = member_group_id
      JOIN organisation on organisation.id = organisation_id
      JOIN scheme on scheme.id = scheme_id
      JOIN journey on member.id = member_id
      WHERE travel_date BETWEEN ? AND ? AND scheme.id = ?
      GROUP BY CONCAT(sub_name, DATE(travel_date));
    `);

    chai.expect(index["subName1"]["2020-01-01"]).to.deep.equal(
      { sub_name: "subName1", date: "2020-01-01", total_distance: 1, total_rewards_earned: 1, total_carbon_saving: 1 }
    );
    chai.expect(index["subName1"]["2020-01-06"]).to.deep.equal(
      { sub_name: "subName1", date: "2020-01-06", total_distance: 1, total_rewards_earned: 1, total_carbon_saving: 1 }
    );
    chai.expect(index["subName2"]["2020-01-01"]).to.deep.equal(
      { sub_name: "subName2", date: "2020-01-01", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 }
    );
    chai.expect(index["subName2"]["2020-01-05"]).to.deep.equal(
      { sub_name: "subName2", date: "2020-01-05", total_distance: 2, total_rewards_earned: 2, total_carbon_saving: 2 }
    );
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
