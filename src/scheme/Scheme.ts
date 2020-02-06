export interface Scheme {
  id: SchemeId | null,
  name: string,
  vac_client_id: number
}

export type SchemeId = number;

export type SchemeJsonView = {
  id?: string,
  name: string,
  vacClientId: number
};

export function fromSchemeId(id: SchemeId): string {
  return "/scheme/" + id;
}

export function toSchemeId(id: string): SchemeId {
  return +(id.substring(id.lastIndexOf("/") + 1));
}
