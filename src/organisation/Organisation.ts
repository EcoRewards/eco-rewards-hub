import { SchemeId } from "../scheme/Scheme";

export interface Organisation {
  id: OrganisationId | null,
  name: string,
  scheme_id: SchemeId
}

export type OrganisationId = number;

export interface OrganisationJsonView {
  id?: string,
  name: string,
  scheme: string
}

export function fromOrganisationId(id: OrganisationId): string {
  return "/organisation/" + id;
}

export function toOrganisationId(id: string): OrganisationId {
  return +(id.substring(id.lastIndexOf("/") + 1));
}
