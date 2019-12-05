import * as chai from "chai";
import { fromMemberId, toMemberId } from "./Member";

describe("toMemberId", () => {

  it("extracts a numeric ID from the resource ID", () => {
    const actual = toMemberId("/member/3023110001112220");

    chai.expect(actual).to.equal(111222);
  });

});

describe("fromMemberId", () => {

  it("extracts creates a resource ID from the numeric ID", () => {
    const actual = fromMemberId(111222);

    chai.expect(actual).to.equal("/member/3023110001112220");
  });

});
