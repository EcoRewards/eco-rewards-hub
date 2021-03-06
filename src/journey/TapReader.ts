import { LocalDateTime } from "@js-joda/core";
import { Logger } from "pino";

/**
 * Turns the raw tap data into an index of member => journey time
 */
export class TapReader {
  private static readonly EPOCH = LocalDateTime.parse("2019-01-01T00:00:00");
  private static readonly FORMATS = {
    // ITSO
    0x63: {
      startOffset: 0,
      length: 8
    },
    // LASSeO
    0x4C: {
      startOffset: 1,
      length: 8
    },
    // null transaction
    0x00: {
      startOffset: 0,
      length: 8
    },
    // NFC
    0x54: {
      startOffset: 1,
      length: 5
    }
  };

  constructor(
    private readonly logger: Logger
  ) { }

  /**
   * Convert the raw ASCII data into a buffer of 16 bit integers (hex values) and extract each tap.
   */
  public getTaps(data: Buffer): MemberJourneys {
    const journeys = {};

    for (let i = 8; i < data.length;) {
      const format = TapReader.FORMATS[data[i]];

      if (format) {
        if (data[i] !== 0x00) {
          const card = Array.from(data.slice(i + format.startOffset, i + format.length + 1));
          const member = card.map(toHex).join("");
          const minsSinceEpoch = data.readUIntBE(i + format.length + 1, 3);

          journeys[member] = TapReader.EPOCH.plusMinutes(minsSinceEpoch).toJSON();
        }

        i = i + format.length + 4;
      }
      else {
        const fullData = Array.from(data).map(toHex).join(" ");
        this.logger.warn("Unknown card type: " + toHex(data[i]) + " full data: " + fullData);
        break;
      }
    }

    return journeys;
  }

}

/**
 * Convert a byte to a hex string
 */
export function toHex(byte: number): string {
  return byte.toString(16).padStart(2, "0");
}

/**
 * Index of member ID / smartcard => travel date
 */
export type MemberJourneys = Record<string, string>;
