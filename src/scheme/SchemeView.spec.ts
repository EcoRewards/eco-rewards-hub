import * as chai from "chai";
import { SchemeView } from "./SchemeView";

describe("SchemeView", () => {
  const view = new SchemeView();

  it("creates a JSON view from a model", async () => {
    const actual = await view.create({}, {
      id: 1,
      name: "scheme",
      vac_client_id: 155
    });

    chai.expect(actual.id).to.equal("/scheme/" + 1);
    chai.expect(actual.name).to.equal("scheme");
    chai.expect(actual.vacClientId).to.equal(155);
  });

});
