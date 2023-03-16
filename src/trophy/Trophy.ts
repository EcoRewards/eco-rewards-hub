
export interface Trophy {
  id: TrophyID | null,
  name: string,
  member_id: number,
  date_awarded: string,
  member_group_id: number,
  rewards: number,
  carbon_saving: number,
  miles: number,
}

export interface TrophyJsonView {
  id: string,
  name: string,
  member: string,
  dateAwarded: string,
  memberGroup: string,
  rewards: number,
  carbonSaving: number,
  miles: number,
}

export function fromTrophyId(id: TrophyID): string {
  return "/trophy/" + id;
}

export function toTrophyId(id: string): TrophyID {
  return +(id.substring(id.lastIndexOf("/") + 1));
}

export type TrophyID = number;
