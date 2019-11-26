import * as chai from "chai";
import { fromOrganisationId, toOrganisationId } from "./Organisation";

describe("toOrganisationId", () => {

  it("extracts a numeric ID from the resource ID", () => {
    const actual = toOrganisationId("/organisation/1");

    chai.expect(actual).to.equal(1);
  });

});

describe("fromOrganisationId", () => {

  it("extracts creates a resource ID from the numeric ID", () => {
    const actual = fromOrganisationId(1);

    chai.expect(actual).to.equal("/organisation/1");
  });

});