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

});

class MockDb {
  public sqlQueries: string[] = [];

  public async query(sql: string, values: any[]): Promise<[QueryResult]> {
    this.sqlQueries.push(sql);

    return [{ insertId: 1 }];
  }
}

interface QueryResult {
  insertId: number;
}
