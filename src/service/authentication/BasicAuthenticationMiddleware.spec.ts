import * as chai from "chai";
import { Cryptography } from "../../cryptography/Cryptography";
import { BasicAuthenticationMiddleware } from "./BasicAuthenticationMiddleware";
import { Base64 } from "js-base64";
import { Context } from "koa";
import toBase64 = Base64.toBase64;
import { AdminRole } from "../../user/AdminUser";

describe("BasicAuthenticationMiddleware", async () => {
  const cryptography = new Cryptography();

  it("authorizes valid requests", async () => {
    const index = {
      "1": { id: 1, email: "1", name: "user1", role: "provider" as AdminRole, password: await cryptography.hash("password1") },
    };

    const middleware = new BasicAuthenticationMiddleware(index, cryptography);
    let hasBeenCalled = false;
    const next = () => hasBeenCalled = true;
    const ctx = createContext("basic " + toBase64("1:password1"));

    await middleware.auth(ctx , next as any);

    chai.expect(hasBeenCalled).to.equal(true);
  });

  it("rejects invalid requests", async () => {
    const index = {
      "1": { id: 1, email: "1", name: "user1", role: "provider" as AdminRole, password: await cryptography.hash("password1") },
    };

    const middleware = new BasicAuthenticationMiddleware(index, cryptography);
    let hasBeenCalled = false;
    const next = () => hasBeenCalled = true;
    const ctx = createContext("basic " + toBase64("1:password2"));

    try {
      await middleware.auth(ctx , next as any);
    }
    catch (e) {

    }

    chai.expect(hasBeenCalled).to.equal(false);
  });

  it("rejects requests where the user doesn't exist", async () => {
    const index = {
      "1": { id: 1, email: "1", name: "user1", role: "provider" as AdminRole, password: await cryptography.hash("password1") },
    };

    const middleware = new BasicAuthenticationMiddleware(index, cryptography);
    let hasBeenCalled = false;
    const next = () => hasBeenCalled = true;
    const ctx = createContext("basic " + toBase64("2:password1"));

    try {
      await middleware.auth(ctx , next as any);
    }
    catch (e) {

    }

    chai.expect(hasBeenCalled).to.equal(false);
  });

  it("does not validate whitelisted requests", async () => {
    const index = {
      "1": { id: 1, email: "1", name: "user1", role: "provider" as AdminRole, password: await cryptography.hash("password1") },
    };

    const middleware = new BasicAuthenticationMiddleware(index, cryptography);
    let hasBeenCalled = false;
    const next = () => hasBeenCalled = true;
    const ctx = createContext("", "/health");
    ctx.req.headers = {}; // no authentication header

    await middleware.auth(ctx , next as any);

    chai.expect(hasBeenCalled).to.equal(true);
  });

});

function createContext(authorization: string, path: string = "/organisation"): Context {
  return {
    req: {
      method: "GET",
      headers: { authorization }
    },
    request: { path },
    throw: (e) => {
      throw new Error(e);
    }
  } as any;
}
