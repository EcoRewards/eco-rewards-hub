/**
 * Rules on a reward point allocation
 */
export class RewardPointPolicy {
  private dailyCap = 400;
  private pointsPerMode = {
    "large car": 0,
    "medium car": 0,
    "small car": 0,
    "car share": 125,
    "electric car": 100,
    "taxi": 50,
    "park and ride": 75,
    "tram": 250,
    "bus": 250,
    "train": 250,
    "cycling": 250,
    "walk": 250,
    "jogging": 250,
    "running": 250,
    "rowing": 250,
    "work from home": 125
  };

  /**
   * Calculate the maximum number of points a member can generate within the cap and then return the number they have
   * generated capped to that point.
   */
  public getRewardPoints(mode: string, distance: number, currentPoints: number) {
    const maxPossibleToEarn = this.dailyCap - currentPoints;
    const points = this.pointsPerMode[mode.toLowerCase()] ?? 0;

    return Math.min(maxPossibleToEarn, points);
  }

}
