import * as chai from "chai";
import { LocalDateTime } from "@js-joda/core";
import { parseTravelDate, toMySqlDateTime } from "./JourneyDate";

describe("JourneyDate", () => {

  it("formats a date on its own as midnight, as sent by the self-report form", () => {
    chai.expect(toMySqlDateTime("2020-06-02")).to.equal("2020-06-02 00:00:00");
  });

  it("formats a local date time without seconds, as sent by a tap", () => {
    chai.expect(toMySqlDateTime("2019-12-19T14:56")).to.equal("2019-12-19 14:56:00");
  });

  it("formats a local date time with seconds", () => {
    chai.expect(toMySqlDateTime("2019-12-11T10:02:20")).to.equal("2019-12-11 10:02:20");
  });

  it("formats an instant as its UTC wall clock, as sent by the mobile clients", () => {
    chai.expect(toMySqlDateTime("2026-10-28T07:39:45.964Z")).to.equal("2026-10-28 07:39:45");
    chai.expect(toMySqlDateTime("2026-10-28T07:39:45Z")).to.equal("2026-10-28 07:39:45");
  });

  it("formats a LocalDateTime", () => {
    chai.expect(toMySqlDateTime(LocalDateTime.parse("2026-10-28T07:39:45"))).to.equal("2026-10-28 07:39:45");
  });

  it("keeps the full seconds of the current time", () => {
    const now = LocalDateTime.parse("2026-10-29T11:00:23.870");

    chai.expect(toMySqlDateTime(now)).to.equal("2026-10-29 11:00:23");
  });

  it("throws on a date it cannot read rather than storing a zero date", () => {
    chai.expect(() => toMySqlDateTime("not-a-date")).to.throw();
    chai.expect(() => toMySqlDateTime("2026-13-45")).to.throw();
    chai.expect(() => toMySqlDateTime("")).to.throw();
  });

  describe("parseTravelDate", () => {

    it("parses the formats the journey sources send", () => {
      chai.expect(parseTravelDate("2020-06-02")!.toString()).to.equal("2020-06-02T00:00");
      chai.expect(parseTravelDate("2026-10-28T07:39:45.964Z")!.toString()).to.equal("2026-10-28T07:39:45.964");
    });

    it("returns undefined for a missing date", () => {
      chai.expect(parseTravelDate(undefined)).to.equal(undefined);
      chai.expect(parseTravelDate("")).to.equal(undefined);
    });

    it("returns undefined for an unreadable date", () => {
      chai.expect(parseTravelDate("not-a-date")).to.equal(undefined);
      chai.expect(parseTravelDate("2026-13-45")).to.equal(undefined);
    });

    it("returns undefined for a string that merely contains a date", () => {
      chai.expect(parseTravelDate("2026-10-28 or thereabouts")).to.equal(undefined);
    });

  });

});
