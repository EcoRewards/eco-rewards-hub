import * as chai from "chai";
import { SchemeFactory } from "./SchemeFactory";

describe("SchemeFactory", () => {
  const factory = new SchemeFactory();

  it("creates a scheme", async () => {
    const scheme = await factory.create("my scheme");

    chai.expect(scheme.id).to.equal(null);
    chai.expect(scheme.name).to.equal("my scheme");
  });

});
