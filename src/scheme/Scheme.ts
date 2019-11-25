import { NonNullId } from "../database/GenericRepository";

export interface Scheme {
  id: SchemeId | null,
  name: string
}

export type SchemeId = number;

export type SchemeJsonView = NonNullId<Scheme>;
