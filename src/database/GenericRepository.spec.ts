import * as chai from "chai";
import { GenericRepository } from "./GenericRepository";

describe("GenericRepository", () => {

  it("generates an upsert", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db, "table");
    const record = {
      id: null,
      field1: "value1",
      field2: 2
    };

    await repository.save(record);

    const sql = db.sqlQueries[0];

    chai.expect(sql).to.equal(
      "INSERT INTO table (id,field1,field2) VALUES (?,?,?) ON DUPLICATE KEY UPDATE field1 = ?,field2 = ?"
    );
  });

  it("sets the id on records", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db, "table");
    const record = {
      id: null,
      field1: "value1",
      field2: 2
    };

    const savedRecord = await repository.save(record);

    chai.expect(savedRecord.id).to.not.equal(null);
  });

  it("selects all records and returns them", async () => {
    const records = [
      { id: 1, name: "text1" },
      { id: 2, name: "text2" },
      { id: 3, name: "text3" }
    ];
    const db = new MockSelectDb(records);
    const repository = new GenericRepository(db, "table");
    const results = await repository.selectAll();

    chai.expect(results).to.deep.equal(records);
  });

  it("selects one record", async () => {
    const records = [
      { id: 2, name: "text2" }
    ];
    const db = new MockSelectDb(records);
    const repository = new GenericRepository(db, "table");
    const results = await repository.selectOne(2);

    chai.expect(results).to.deep.equal(records[0]);
  });

  it("indexes by id", async () => {
    const records = [
      { id: 1, name: "text1" },
      { id: 2, name: "text2" },
      { id: 3, name: "text3" }
    ];
    const db = new MockSelectDb(records);
    const repository = new GenericRepository(db, "table");
    const index = repository.getIndexedById();

    chai.expect(index[1]).to.not.equal(records[0]);
    chai.expect(index[2]).to.not.equal(records[1]);
    chai.expect(index[3]).to.not.equal(records[2]);
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
