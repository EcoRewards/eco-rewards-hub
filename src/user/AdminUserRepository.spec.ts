import * as chai from "chai";
import { AdminUserRepository } from "./AdminUserRepository";
import { AdminUser } from "./AdminUser";

const rows: AdminUser[] = [
  { id: 1, email: "test1@test.com", name: "user1", role: "admin", password: Buffer.from("pass1") as any },
  { id: 2, email: "test2@test.com", name: "user2", role: "admin", password: Buffer.from("pass2") as any },
  { id: 3, email: "test3@test.com", name: "user3", role: "admin", password: Buffer.from("pass3") as any },
  { id: 4, email: "test4@test.com", name: "user4", role: "admin", password: Buffer.from("pass4") as any }
];

describe("AdminUserRepository", () => {

  it("indexes users by email", async () => {
    const repository = new AdminUserRepository(new MockDb());
    const index = await repository.getUserIndex();
    const expected = rows.map(u => ({ ...u, password: u.password.toString() }));

    chai.expect(index["test1@test.com"]).to.deep.equal(expected[0]);
    chai.expect(index["test2@test.com"]).to.deep.equal(expected[1]);
    chai.expect(index["test3@test.com"]).to.deep.equal(expected[2]);
    chai.expect(index["test4@test.com"]).to.deep.equal(expected[3]);
  });

});

class MockDb {

  public async query(sql: string, values: any[]): Promise<[AdminUser[]]> {
    return [rows];
  }
}
