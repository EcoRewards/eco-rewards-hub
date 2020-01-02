import { GroupId } from "../group/Group";
import * as luhn from "luhn-generator";

export interface Member {
  id: MemberId | null,
  member_group_id: GroupId,
  rewards: number,
  carbon_saving: number,
  default_transport_mode: string,
  default_distance: number,
  smartcard: string | null
}

export type MemberId = number;

export interface MemberJsonView {
  id: string,
  group: string
  rewards: number
  carbonSaving: number
  defaultTransportMode: string
  defaultDistance: number
}

export function fromMemberId(id: MemberId): string {
  return "/member/" + luhn.generate((id + "").padStart(9, "0"));
}

export function toMemberId(id: string): MemberId {
  const accountNumber = id.substr(id.lastIndexOf("/") + 1);

  if (!luhn.validate(accountNumber)) {
    throw Error("Invalid account number: " + accountNumber);
  }

  return +(accountNumber.substr(6, 9));
}
