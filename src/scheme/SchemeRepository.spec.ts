import * as chai from "chai";
import { SchemeRepository } from "./SchemeRepository";

const schemes = [
  { id: 1, name: "name1" },
  { id: 2, name: "name2" },
  { id: 3, name: "name3" },
  { id: 4, name: "name4" }
];

describe("SchemeRepository", () => {

  it("indexes schemes by id", async () => {
    const repository = new SchemeRepository(new MockDb());
    const index = repository.getSchemeIndex();

    chai.expect(index[1]).to.not.equal(schemes[0]);
    chai.expect(index[2]).to.not.equal(schemes[1]);
    chai.expect(index[3]).to.not.equal(schemes[2]);
    chai.expect(index[4]).to.not.equal(schemes[3]);
  });

});

class MockDb {

  public async query(sql: string, values: any[]) {
    return [schemes];
  }

}
