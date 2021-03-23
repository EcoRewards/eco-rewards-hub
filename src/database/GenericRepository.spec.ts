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

  it("abandons a bulk insert if the number of records is 0", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db, "table");
    const records = [];
    await repository.insertAll(records);

    const sql = db.sqlQueries[0];

    chai.expect(sql).to.equal(undefined);
  });

  it("generates an a bulk insert", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db, "table");
    const records = [{
      id: null,
      field1: "value1",
      field2: 2
    }, {
      id: null,
      field1: "value2",
      field2: 3
    }];

    await repository.insertAll(records);

    const sql = db.sqlQueries[0];

    chai.expect(sql).to.equal("INSERT INTO table (id,field1,field2) VALUES (?,?,?),(?,?,?)");
  });

  it("generates ids for a bulk insert", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db, "table");
    const records = [{
      id: null,
      field1: "value1",
      field2: 2
    }, {
      id: null,
      field1: "value2",
      field2: 3
    }];

    const savedRecords = await repository.insertAll(records);

    chai.expect(savedRecords[0].id).to.equal(1);
    chai.expect(savedRecords[1].id).to.equal(2);
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

  it("deletes a record", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db, "table");
    await repository.deleteOne(1);

    const sql = db.sqlQueries[0];

    chai.expect(sql).to.equal("DELETE FROM table WHERE id = ?");
    chai.expect(db.transaction).to.equal(true);
    chai.expect(db.transactionAborted).to.equal(false);
    chai.expect(db.transactionCommitted).to.equal(true);
    chai.expect(db.connectionReleased).to.equal(true);
  });

  it("rolls back a transaction of the delete fails", async () => {
    const db = new MockDb();
    db.shouldError = true;

    const repository = new GenericRepository(db, "table");
    await repository.deleteOne(1);

    chai.expect(db.transaction).to.equal(true);
    chai.expect(db.transactionAborted).to.equal(true);
    chai.expect(db.transactionCommitted).to.equal(false);
    chai.expect(db.connectionReleased).to.equal(true);
  });

  it("cleans up relationships", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db, "table", { "relation": "column" });
    await repository.deleteOne(1);

    const [sql, relationSql] = db.sqlQueries;

    chai.expect(sql).to.equal("DELETE FROM table WHERE id = ?");
    chai.expect(relationSql).to.equal("UPDATE relation SET column = 1 WHERE column = ?");
    chai.expect(db.transaction).to.equal(true);
    chai.expect(db.transactionAborted).to.equal(false);
    chai.expect(db.transactionCommitted).to.equal(true);
    chai.expect(db.connectionReleased).to.equal(true);
  });

  it("generates an update", async () => {
    const db = new MockDb();
    const repository = new GenericRepository(db, "table");
    const record = {
      field1: "value1",
      field2: 2
    };

    await repository.updateRange(1, 3, record);

    const sql = db.sqlQueries[0];

    chai.expect(sql).to.equal(
      "UPDATE table SET field1 = ?,field2 = ? WHERE id >= 1 AND id <= 3"
    );
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
