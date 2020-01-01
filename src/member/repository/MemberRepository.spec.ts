import * as chai from "chai";
import { MemberRepository } from "./MemberRepository";

describe("MemberRepository", () => {

  it("selects by smartcard number", async () => {
    const records = [
      { id: 2, name: "text2" }
    ];
    const db = new MockSelectDb(records);
    const repository = new MemberRepository(db);
    await repository.selectBySmartcard("2");

    chai.expect(db.queries[0]).to.equal("SELECT * FROM member WHERE smartcard = ?");
  });

});

class MockSelectDb<T> {
  queries: string[] = [];

  constructor(
    private readonly results: T
  ) {}

  public async query(sql: string, values: any[]): Promise<[T]> {
    this.queries.push(sql);

    return [this.results];
  }
}

interface QueryResult {
  insertId: number;
}
