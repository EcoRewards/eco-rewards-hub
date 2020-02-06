import * as chai from "chai";
import { SchemeModelFactory } from "./SchemeModelFactory";

describe("SchemeModelFactory", () => {
  const factory = new SchemeModelFactory();

  it("creates a model from a JSON view", async () => {
    const actual = await factory.create({
      id: "/scheme/1",
      name: "org",
      vacClientId: 155
    });

    chai.expect(actual.id).to.equal(1);
    chai.expect(actual.name).to.equal("org");
    chai.expect(actual.vac_client_id).to.equal(155);
  });

  it("creates a model from a JSON view with a null ID", async () => {
    const actual = await factory.create({
      name: "org",
      vacClientId: 155
    });

    chai.expect(actual.id).to.equal(null);
    chai.expect(actual.name).to.equal("org");
    chai.expect(actual.vac_client_id).to.equal(155);
  });

});
