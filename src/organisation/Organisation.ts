import { SchemeId } from "../scheme/Scheme";

export interface Organisation {
  id: OrganisationId | null,
  name: string,
  scheme_id: SchemeId,
  api_key: string
}

export type OrganisationId = number;
