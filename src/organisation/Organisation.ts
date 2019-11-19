import { SchemeId } from "../scheme/Scheme";

export interface Organisation {
  id: OrganisationId | null,
  name: string,
  scheme_id: SchemeId,
  oauth_secret: string
}

export type OrganisationId = number;
