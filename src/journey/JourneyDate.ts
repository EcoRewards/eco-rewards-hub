import { DateTimeFormatter, Instant, LocalDate, LocalDateTime, ZoneId } from "@js-joda/core";

const mySqlDateTime = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

export const travelDateInvalidError = "Travel date must be set";

/**
 * Journey sources send travel dates in several shapes: a date on its own from the self-report form,
 * a local date time from a tap, and an instant from the mobile clients. Instants are read as UTC,
 * which is the wall clock the database has always stored.
 *
 * Throws if the date cannot be parsed.
 */
export function toLocalDateTime(date: string): LocalDateTime {
  if (date.endsWith("Z")) {
    return LocalDateTime.ofInstant(Instant.parse(date), ZoneId.UTC);
  }

  return date.includes("T") ? LocalDateTime.parse(date) : LocalDate.parse(date).atStartOfDay();
}

/**
 * Format a date for a MySQL datetime column. The database runs in strict mode, so anything it
 * cannot read is rejected outright rather than stored as a zero date.
 */
export function toMySqlDateTime(date: string | LocalDateTime): string {
  const localDateTime = typeof date === "string" ? toLocalDateTime(date) : date;

  return localDateTime.format(mySqlDateTime);
}

/**
 * Parse a travel date, returning undefined rather than throwing so that callers can report it as a
 * validation error.
 */
export function parseTravelDate(date?: string): LocalDateTime | undefined {
  if (!date) {
    return undefined;
  }

  try {
    return toLocalDateTime(date);
  }
  catch {
    return undefined;
  }
}
