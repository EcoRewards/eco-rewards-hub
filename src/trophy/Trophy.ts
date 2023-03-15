
export interface Trophy {
  id: TrophyID | null,
  name: string,
  member_id: number,
  date_awarded: Date,
  member_group_id: number,
  rewards: number,
  carbon_savings: number,
  miles: number,
}

export interface TrophyJsonView {
  id: string,
  name: string,
  member: string,
  dateAwarded: string,
  memberGroup: string,
  rewards: number,
  carbonSavings: number,
  miles: number,
}

export function fromTrophyId(id: TrophyID): string {
  return "/trophy/" + id;
}

export function toTrophyId(id: string): TrophyID {
  return +(id.substring(id.lastIndexOf("/") + 1));
}

export type TrophyID = number;
