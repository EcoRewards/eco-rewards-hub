import * as chai from "chai";
import { fromSchemeId, toSchemeId } from "./Scheme";

describe("toSchemeId", () => {

  it("extracts a numeric ID from the resource ID", () => {
    const actual = toSchemeId("/scheme/1");

    chai.expect(actual).to.equal(1);
  });

});

describe("fromSchemeId", () => {

  it("extracts creates a resource ID from the numeric ID", () => {
    const actual = fromSchemeId(1);

    chai.expect(actual).to.equal("/scheme/1");
  });

});