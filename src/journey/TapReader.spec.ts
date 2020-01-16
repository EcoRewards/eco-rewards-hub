import * as chai from "chai";
import { TapReader } from "./TapReader";
import btoa = require("btoa");

describe("TapReader", () => {
  const logger = {
    e: "",
    warn(e: string) {
      this.e = e;
    }
  };
  const reader = new TapReader(logger as any);

  it("reads a LASSeO card and nfc payloads", () => {
    const hex = "05111870000000124C633800008535150107BF8054222223001307BF8054222223001207BF81";
    const buffer = Buffer.from(hex, "hex");
    const payload = btoa(buffer);

    const journeys = reader.getTaps(payload);

    chai.expect(journeys["2222230012"]).to.equal("2019-12-19T14:57");
    chai.expect(journeys["2222230013"]).to.equal("2019-12-19T14:56");
    chai.expect(journeys["6338000085351501"]).to.equal("2019-12-19T14:56");
  });

  it("reads an ITSO card and nfc payloads", () => {
    const hex = "051118700000001263003800008535150107BF8054222223001307BF8054222223001207BF81";
    const buffer = Buffer.from(hex, "hex");
    const payload = btoa(buffer);

    const journeys = reader.getTaps(payload);

    chai.expect(journeys["630038000085351501"]).to.equal("2019-12-19T14:56");
  });

  it("generates a warning for unknown payloads", () => {
    const hex = "0511187000000012AA003800008535150107BF8054222223001307BF8054222223001207BF81";
    const buffer = Buffer.from(hex, "hex");
    const payload = btoa(buffer);

    const journeys = reader.getTaps(payload);

    chai.expect(logger.e).to.deep.equal("Unknown card type: aa full data: 05 11 18 70 00 00 00 12 aa 00 38 00 00 85 35 15 01 07 bf 80 54 22 22 23 00 13 07 bf 80 54 22 22 23 00 12 07 bf 81");
  });

});
