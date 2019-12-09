import * as chai from "chai";
import { fromMemberId, toMemberId } from "./Member";

describe("toMemberId", () => {

  it("extracts a numeric ID from the resource ID", () => {
    const actual = toMemberId("/member/3023110001112220");

    chai.expect(actual).to.equal(111222);
  });

  it("works with just the number", () => {
    const actual = toMemberId("3023110001112220");

    chai.expect(actual).to.equal(111222);
  });

  it("throws an error of the checksum is invalid", () => {
    chai.expect(() => toMemberId("/member/3023110001112221")).to.throw(Error);
  });

});

describe("fromMemberId", () => {

  it("extracts creates a resource ID from the numeric ID", () => {
    const actual = fromMemberId(111222);

    chai.expect(actual).to.equal("/member/3023110001112220");
  });

});
