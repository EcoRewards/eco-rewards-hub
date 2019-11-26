import * as chai from "chai";
import { SchemeViewFactory } from "./SchemeViewFactory";
import { SchemeView } from "./SchemeView";

describe("SchemeViewFactory", () => {
  const factory = new SchemeViewFactory();

  it("creates a view", async () => {
    const view = await factory.create();

    chai.expect(view instanceof SchemeView).to.equal(true);
  });

});
