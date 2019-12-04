import * as chai from "chai";
import { fromMemberId, toMemberId } from "./Member";

describe("toMemberId", () => {

  it("extracts a numeric ID from the resource ID", () => {
    const actual = toMemberId("/member/1");

    chai.expect(actual).to.equal(1);
  });

});

describe("fromMemberId", () => {

  it("extracts creates a resource ID from the numeric ID", () => {
    const actual = fromMemberId(1);

    chai.expect(actual).to.equal("/member/1");
  });

});
