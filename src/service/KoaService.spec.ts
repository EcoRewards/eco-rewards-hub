import * as chai from "chai";
import { KoaService } from "./KoaService";
import * as pino from "pino";

describe("KoaService", () => {

  it("starts on the configured port", () => {
    const mockKoa = new MockApp() as any;
    const mockRouter = new MockRouter() as any;
    const mockAuth = new MockAuth() as any;
    const koa = new KoaService(8080, mockKoa, mockRouter, mockAuth, pino({ level: "fatal" }));

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
