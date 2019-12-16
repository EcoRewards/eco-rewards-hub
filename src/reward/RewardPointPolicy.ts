import { CarbonSavingPolicy } from "./CarbonSavingPolicy";

/**
 * Rules on a reward point allocation
 */
export class RewardPointPolicy {
  private dailyCap = 400;
  private pointsPerTrip = 250;

  /**
   * Calculate the maximum number of points a member can generate within the cap and then return the number they have
   * generated capped to that point.
   */
  public getRewardPoints(mode: string, distance: number, currentPoints: number) {
    const maxPossibleToEarn = this.dailyCap - currentPoints;

    return Math.min(maxPossibleToEarn, this.pointsPerTrip);
  }

}
