import * as chai from "chai";
import { LoginController } from "./LoginController";
import { Cryptography } from "../../cryptography/Cryptography";
import { HttpResponse } from "../../service/controller/HttpResponse";

class MockAdminUserRepository {
  crpyto = new Cryptography();

  public async getUserIndex() {
    return {
      "test@test.com": { id: 1, email: "test@test.com", password: await this.crpyto.hash("password") },
    };
  }
}

describe("LoginController", () => {
  const controller = new LoginController(
    new MockAdminUserRepository() as any,
    new Cryptography()
  );

  it("returns a token for valid requests", async () => {
    const body = {
      username: "test@test.com",
      password: "password"
    };
    const result = await controller.post({request: { body: body }}) as any;

    chai.expect(result.data.token).to.not.equal(undefined);
  });

  it("returns a 401 for unknown users", async () => {
    const body = {
      username: "test2@test.com",
      password: "password"
    };
    const result = await controller.post({request: { body: body }}) as any;

    chai.expect(result.code).to.equal(401);
  });

  it("returns a 401 for incorrect passwords", async () => {
    const body = {
      username: "test@test.com",
      password: "derp"
    };
    const result = await controller.post({request: { body: body }}) as any;

    chai.expect(result.code).to.equal(401);
  });

});
