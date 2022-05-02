import * as luhn from "luhn-generator";

export interface Location {
  id: LocationId | null,
  name: string,
  notes: string
}

export interface LocationJsonView {
  id?: string,
  name: string,
  notes: string,
  url: string
}

export function fromLocationId(id: LocationId): string {
  const viewId = luhn.generate(id, { pad: 9 });

  return "/location/" + viewId;
}

export function toLocationId(id: string): LocationId {
  const locationId = id.substr(id.lastIndexOf("/") + 1);

  if (!luhn.validate(locationId)) {
    throw Error("Invalid location number: " + locationId);
  }

  return +locationId.substring(0, 8);
}

export type LocationId = number;
