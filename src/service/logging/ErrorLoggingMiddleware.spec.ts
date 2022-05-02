import * as chai from "chai";
import pino from "pino";
import { ErrorLoggingMiddleware } from "./ErrorLoggingMiddleware";

describe("ErrorLoggingMiddleware", () => {
  const logger = pino({ level: "fatal" });
  const errorLogger = new ErrorLoggingMiddleware(logger);
  const exceptionThrower = async () => { throw "Error"; };
  const exceptionThrower2 = async () => { throw { httpCode: 401, message: "Fail" }; };
  const swagger = ctx => async () => { ctx.status = 500; };

  it("catches exceptions", async () => {
    const ctx = new MockCtx() as any;

    await errorLogger.errorHandler(ctx, exceptionThrower);

    chai.expect(ctx.status).to.equal(500);
  });

  it("catches exceptions with http codes", async () => {
    const ctx = new MockCtx() as any;

    await errorLogger.errorHandler(ctx, exceptionThrower2);

    chai.expect(ctx.status).to.equal(401);
  });

  it("500 errors from swagger", async () => {
    const ctx = new MockCtx() as any;

    await errorLogger.errorHandler(ctx, swagger(ctx));

    chai.expect(ctx.status).to.equal(500);
  });

  it("does nothing if there are no exceptions", async () => {
    const ctx = new MockCtx() as any;

    await errorLogger.errorHandler(ctx, async () => { ctx.status = 200; });

    chai.expect(ctx.status).to.equal(200);
  });

});

class MockCtx {
  status = 200;

  throw(httpCode: number) {
    this.status = httpCode;
  }
}
