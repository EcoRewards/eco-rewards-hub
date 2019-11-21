import * as chai from "chai";
import { GenericRepository } from "./GenericRepository";

describe("GenericRepository", () => {

  it("generates an upsert", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db);
    const record = {
      id: null,
      field1: "value1",
      field2: 2
    };

    await repository.save("table", record);

    const sql = db.sqlQueries[0];

    chai.expect(sql).to.equal("INSERT INTO table VALUES (?,?,?) ON DUPLICATE KEY UPDATE field1 = ?,field2 = ?");
  });

  it("sets the id on records", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db);
    const record = {
      id: null,
      field1: "value1",
      field2: 2
    };

    const savedRecord = await repository.save("table", record);

    chai.expect(savedRecord.id).to.not.equal(null);
  });

  it("selects all records and returns them", async () => {
    const records = [
      { id: 1, name: "text1" },
      { id: 2, name: "text2" },
      { id: 3, name: "text3" }
    ];
    const db = new MockSelectDb(records);
    const repository = new GenericRepository(db);
    const results = await repository.selectAll("table");

    chai.expect(results).to.deep.equal(records);
  });

});

class MockDb {
  public sqlQueries: string[] = [];

  public async query(sql: string, values: any[]): Promise<[QueryResult]> {
    this.sqlQueries.push(sql);

    return [{ insertId: 1 }];
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
