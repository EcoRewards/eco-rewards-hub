import { CarbonSavingPolicy } from "./CarbonSavingPolicy";

/**
 * Rules on a reward point allocation
 */
export class RewardPointPolicy {
  private dailyCap = 400;

  constructor(
    private readonly carbonSavingPolicy: CarbonSavingPolicy
  ) { }

  /**
   * Calculate the maximum number of points a member can generate within the cap and then return the number they have
   * generated capped to that point.
   */
  public getRewardPoints(mode: string, distance: number, currentPoints: number) {
    const maxPossibleToEarn = this.dailyCap - currentPoints;
    const pointsEarned = this.carbonSavingPolicy.getCarbonSaving(mode, distance) * 100;

    return Math.round(Math.min(maxPossibleToEarn, pointsEarned));
  }

}
