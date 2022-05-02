import * as chai from "chai";
import { LocationModelFactory } from "./LocationModelFactory";

describe("LocationModelFactory", () => {
  const factory = new LocationModelFactory();

  it("creates a model from a JSON view", async () => {
    const actual = await factory.create({
      id: "/location/100110014",
      name: "org",
      notes: "Notes",
      url: ""
    });

    chai.expect(actual.id).to.equal(10011001);
    chai.expect(actual.name).to.equal("org");
    chai.expect(actual.notes).to.equal("Notes");
  });

  it("creates a model from a JSON view with a null ID", async () => {
    const actual = await factory.create({
      name: "org",
      notes: "Notes",
      url: ""
    });

    chai.expect(actual.id).to.equal(null);
    chai.expect(actual.name).to.equal("org");
    chai.expect(actual.notes).to.equal("Notes");
  });

});
