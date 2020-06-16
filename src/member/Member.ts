import { GroupId } from "../group/Group";
import * as luhn from "luhn-generator";

export interface Member {
  id: MemberId | null,
  member_group_id: GroupId,
  rewards: number,
  carbon_saving: number,
  default_transport_mode: string,
  default_distance: number,
  smartcard: string | null,
  total_miles: number,
  previous_transport_mode: string | null
}

export type MemberId = number;

export interface MemberJsonView {
  id: string,
  group: string
  rewards: number
  carbonSaving: number
  defaultTransportMode: string
  defaultDistance: number,
  totalMiles: number,
  previousTransportMode: string
}

export function fromMemberId(id: MemberId | string): string {
  const viewId = typeof id === "string" && id.length >= 16 ? id : luhn.generate(id, { pad: 10 });

  return "/member/" + viewId;
}

export function toMemberId(id: string): MemberId {
  const accountNumber = id.substr(id.lastIndexOf("/") + 1);

  if (!luhn.validate(accountNumber)) {
    throw Error("Invalid account number: " + accountNumber);
  }

  return +accountNumber.substring(0, 9);
}

/**
 * Format a member ID for CSV. Excel and LibreOffice only support 15 digit numbers so we must add dashes to force text
 * mode
 */
export function formatIdForCsv(id: string) {
  id = id.substr(id.lastIndexOf("/") + 1);

  if (id.length === 16) {
    return [id.substr(0, 4), id.substr(4, 4), id.substr(8, 4), id.substr(12, 4)].join("-");
  }
  else if (id.length === 18) {
    return [id.substr(0, 6), id.substr(6, 4), id.substr(10, 4), id.substr(14, 4)].join("-");
  }
  else {
    return id;
  }
}