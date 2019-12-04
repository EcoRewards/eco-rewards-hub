import { GroupId } from "../group/Group";

export interface Member {
  id: MemberId | null,
  member_group_id: GroupId,
  rewards: number,
  carbon_saving: number,
  default_transport_mode: string,
  default_distance: number
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
  return "/member/" + id;
}

export function toMemberId(id: string): MemberId {
  return +(id.substring(id.lastIndexOf("/") + 1));
}
