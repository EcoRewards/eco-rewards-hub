import * as chai from "chai";
import { LocationViewFactory } from "./LocationViewFactory";

describe("LocationViewFactory", () => {
  const view = new LocationViewFactory();

  it("creates a JSON view", async () => {
    const actual = await view.create();

    chai.expect(actual).to.not.equal(null);
  });

});
