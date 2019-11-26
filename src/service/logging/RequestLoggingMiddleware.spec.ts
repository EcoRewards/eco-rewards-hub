import * as chai from "chai";
import * as pino from "pino";
import { RequestLoggingMiddleware } from "./RequestLoggingMiddleware";

describe("RequestLoggingMiddleware", () => {
  const logger = pino({ level: "fatal" });
  const requestLogger = new RequestLoggingMiddleware(logger);

  it("logs request responses", async () => {
    const ctx = new MockCtx() as any;

    await requestLogger.requestLogger(ctx, () => new Promise(r => setTimeout(r, 100)));

    chai.expect(ctx.status).to.equal(200);
  });

});

class MockCtx {
  status = 200;
  set() {

  }
}