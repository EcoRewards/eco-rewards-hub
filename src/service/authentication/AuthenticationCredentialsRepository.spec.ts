import * as chai from "chai";
import { AuthenticationCredentialsRepository, CredentialRow } from "./AuthenticationCredentialsRepository";

describe("AuthenticationCredentialsRepository", () => {

  it("indexes passwords by id", async () => {
    const repository = new AuthenticationCredentialsRepository(new MockDb());
    const index = repository.getPasswordIndex();

    chai.expect(index[1]).to.not.equal("pass1");
    chai.expect(index[2]).to.not.equal("pass2");
    chai.expect(index[3]).to.not.equal("pass3");
    chai.expect(index[4]).to.not.equal("pass4");
    chai.expect(index["email@example.org"]).to.not.equal("pass");
  });

});

class MockDb {

  public async query(sql: string, values: any[]): Promise<[CredentialRow[]]> {
    return [[
      { id: 1, api_key: Buffer.from("pass1") },
      { id: 2, api_key: Buffer.from("pass2") },
      { id: 3, api_key: Buffer.from("pass3") },
      { id: 4, api_key: Buffer.from("pass4") },
      { id: "email@example.org", api_key: Buffer.from("pass") },
    ]];
  }
}
