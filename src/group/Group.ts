import { OrganisationId } from "../organisation/Organisation";

export interface Group {
    id: GroupId | null,
    name: string,
    organisation_id: OrganisationId
}

export type GroupId = number;

export interface GroupJsonView {
    id?: string,
    name: string,
    organisation: string
}

export function fromGroupId(id: GroupId): string {
    return "/group/" + id;
}

export function toGroupId(id: string): GroupId {
    return +(id.substring(id.lastIndexOf("/") + 1));
}

