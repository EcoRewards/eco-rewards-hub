import * as chai from "chai";
import { TrophyViewFactory } from "./TrophyViewFactory";

describe("TrophyViewFactory", () => {
  const view = new TrophyViewFactory();

  it("creates a JSON view", async () => {
    const actual = await view.create();

    chai.expect(actual).to.not.equal(null);
  });

});
