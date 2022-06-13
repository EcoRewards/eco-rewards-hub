import * as chai from "chai";
import { BlacklistBodyParser } from "./BlacklistBodyParser";

describe("BlacklistBodyParser", () => {
  const middleware = new BlacklistBodyParser([
    "/journeys"
  ]);

  it("disables the body parser if the request is blacklisted", async () => {
    const ctx = new MockCtx("/journeys") as any;

    await middleware.disableBodyParser(ctx, async () => {});

    chai.expect(ctx.disableBodyParser).to.equal(true);
  });

  it("disables the body parser if the request is blacklisted unless json is requested", async () => {
    const ctx = new MockCtx("/journeys", { "content-type": "application/json" }) as any;

    await middleware.disableBodyParser(ctx, async () => {});

    chai.expect(ctx.disableBodyParser).to.equal(false);
  });

  it("ignores the request if it's not blacklisted", async () => {
    const ctx = new MockCtx("/login") as any;

    await middleware.disableBodyParser(ctx, async () => {});

    chai.expect(ctx.disableBodyParser).to.equal(undefined);
  });

});

class MockCtx {
  public disableBodyParser?: boolean;

  constructor(
    public readonly path: string,
    public readonly headers: any = { }
  ) { }

}
