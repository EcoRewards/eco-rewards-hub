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
  carbon_saving: number | null,
  device_id: string,
  latitude: number | null,
  longitude: number | null,
  type: JourneyType
}

export interface JourneyJsonView {
  source: string,
  uploaded: string,
  processed: string | null,
  travelDate: string,
  memberId: string,
  distance: number,
  mode: string,
  rewardsEarned: number | null,
  carbonSaving: number | null,
  deviceId: string,
  latitude: number | null,
  longitude: number | null,
  type: JourneyType
}

export type JourneyId = number;

export type JourneyType = "journey" | "leisure";
