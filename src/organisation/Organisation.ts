import { SchemeId } from "../scheme/Scheme";

export interface Organisation {
  id: OrganisationId | null,
  name: string,
  scheme_id: SchemeId
}

export type OrganisationId = number;
