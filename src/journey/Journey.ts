import { MemberId } from "../member/Member";
import { AdminUserId } from "../user/AdminUser";

export interface Journey {
  id: JourneyId | null,
  admin_user_id: AdminUserId,
  uploaded: string,
  processed: string | null,
  travel_date: string,
  member_id: MemberId,
  distance: number,
  mode: string,
  rewards_earned: number | null,
  carbon_saving: number | null
}

export type JourneyId = number;