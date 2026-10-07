import { ChronoUnit, LocalDate, LocalDateTime } from "@js-joda/core";

const tapEpoch = LocalDateTime.parse("2019-01-01T00:00:00");

/**
 * GET /journeys only returns the last 18 months, so travel dates in feature tables are written as
 * the {date} token and resolved to this. A hard coded date silently ages out of that window and
 * the scenarios then find no journeys at all.
 */
export const fixtureDate: LocalDate = LocalDate.now().minusDays(7);

/**
 * The time of day a tap is reported at, which the payload can only carry to minute precision
 */
export const fixtureTapTime: LocalDateTime = fixtureDate.atTime(12, 48);

/**
 * Replace the {date} token in a feature table cell with the fixture date
 */
export function resolveDateToken(value: string): string {
  return value.split("{date}").join(fixtureDate.toString());
}

/**
 * A tap payload carries its travel time as three bytes of minutes since 2019-01-01
 */
export function minutesSinceTapEpoch(time: LocalDateTime): string {
  return tapEpoch.until(time, ChronoUnit.MINUTES).toString(16).padStart(6, "0");
}
