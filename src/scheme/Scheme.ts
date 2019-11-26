export interface Scheme {
  id: SchemeId | null,
  name: string
}

export type SchemeId = number;

export type SchemeJsonView = {
  id?: string,
  name: string
};

export function fromSchemeId(id: SchemeId): string {
  return "/scheme/" + id;
}

export function toSchemeId(id: string): SchemeId {
  return +(id.substring(id.lastIndexOf("/") + 1));
}
