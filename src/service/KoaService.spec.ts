import * as chai from "chai";
import { KoaService } from "./KoaService";
import * as pino from "pino";

describe("KoaService", () => {

  it("starts on the configured port", () => {
    const mock = new MockApp() as any;
    const koa = new KoaService(8080, mock, pino({ level: "fatal" }));

    koa.start();

    chai.expect(mock.port).to.equal(8080);
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
