import * as chai from "chai";
import { LocationView } from "./LocationView";

describe("LocationView", () => {
  const view = new LocationView();

  it("creates a JSON view from a model", async () => {
    const actual = view.create({}, {
      id: 10011001,
      name: "Location",
      notes: "Notes",
      defaultJourneyType: "leisure"
    });

    chai.expect(actual.id).to.equal("/location/100110014");
    chai.expect(actual.name).to.equal("Location");
    chai.expect(actual.notes).to.equal("Notes");
    chai.expect(actual.defaultJourneyType).to.equal("leisure");
    chai.expect(actual.url).to.equal("https://www.ecorewards.co.uk/scan?location=100110014");
  });

});
