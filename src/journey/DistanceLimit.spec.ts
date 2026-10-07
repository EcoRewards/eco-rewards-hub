import * as chai from "chai";
import {
  distanceNegativeError,
  distanceNotANumberError,
  distanceTooLargeError,
  getMaxDistance,
  validateDistance
} from "./DistanceLimit";

describe("DistanceLimit", () => {

  it("caps most modes at 99 miles", () => {
    chai.expect(getMaxDistance("bus")).to.equal(99);
    chai.expect(getMaxDistance("walk")).to.equal(99);
    chai.expect(getMaxDistance(undefined)).to.equal(99);
  });

  it("caps train journeys at 500 miles", () => {
    chai.expect(getMaxDistance("train")).to.equal(500);
  });

  it("ignores the case of the mode", () => {
    chai.expect(getMaxDistance("Train")).to.equal(500);
    chai.expect(getMaxDistance("TRAIN")).to.equal(500);
  });

  it("caps modes named after inherited properties", () => {
    for (const mode of ["constructor", "__proto__", "toString", "valueOf", "hasOwnProperty"]) {
      chai.expect(getMaxDistance(mode)).to.equal(99);
      chai.expect(validateDistance(9999, mode)).to.deep.equal([distanceTooLargeError]);
    }
  });

  it("accepts a distance within the limit", () => {
    chai.expect(validateDistance(99, "bus")).to.deep.equal([]);
    chai.expect(validateDistance(500, "train")).to.deep.equal([]);
    chai.expect(validateDistance(0, "bus")).to.deep.equal([]);
  });

  it("rejects a distance over the limit", () => {
    chai.expect(validateDistance(100, "bus")).to.deep.equal([distanceTooLargeError]);
    chai.expect(validateDistance(501, "train")).to.deep.equal([distanceTooLargeError]);
  });

  it("rejects a train distance over 99 miles in any other mode", () => {
    chai.expect(validateDistance(250, "Train")).to.deep.equal([]);
    chai.expect(validateDistance(250, "bus")).to.deep.equal([distanceTooLargeError]);
  });

  it("rejects a negative distance", () => {
    chai.expect(validateDistance(-1, "bus")).to.deep.equal([distanceNegativeError]);
  });

  it("rejects a distance that is not a number", () => {
    chai.expect(validateDistance(NaN, "bus")).to.deep.equal([distanceNotANumberError]);
  });

});
