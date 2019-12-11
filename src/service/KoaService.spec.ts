import * as chai from "chai";
import { KoaService } from "./KoaService";
import * as pino from "pino";
import * as swagger from "swagger2";
import { Document } from "swagger2/dist/schema";
import { ErrorLoggingMiddleware } from "./logging/ErrorLoggingMiddleware";
import { RequestLoggingMiddleware } from "./logging/RequestLoggingMiddleware";
import { BlacklistBodyParser } from "./parser/BlacklistBodyParser";

describe("KoaService", () => {
  const logger = pino({ level: "fatal" });
  const document = swagger.loadDocumentSync("documentation/swagger/api.yaml") as Document;
  const errorLogger = new ErrorLoggingMiddleware(logger);
  const requestLogger = new RequestLoggingMiddleware(logger);
  const blacklistBodyParser = new BlacklistBodyParser(["/journey"]);

  it("starts on the configured port", () => {
    const mockKoa = new MockApp() as any;
    const mockRouter = new MockRouter() as any;
    const mockAuth = new MockAuth() as any;
    const koa = new KoaService(
      8080,
      mockKoa,
      mockRouter,
      mockAuth,
      document,
      errorLogger,
      requestLogger,
      blacklistBodyParser,
      logger
    );

    koa.start();

    chai.expect(mockKoa.port).to.equal(8080);
  });

});

class MockApp {
  public port: number = 0;

  public use(): MockApp {
    return this;
  }

  public listen(port: number): void {
    this.port = port;
  }

}

class MockRouter {
  public routes() {

  }

  public allowedMethods() {

  }
}

class MockAuth {
  public auth() {

  }
}
