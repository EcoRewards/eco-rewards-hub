
/**
 * Calculate carbon savings
 */
export class CarbonSavingPolicy {
  private referenceMode = "medium car";
  private carbonCostPerMile = {
    "large car": 0.47414,
    "medium car": 0.32241,
    "small car": 0.25794,
    "car share": 0.161205,
    "electric car": 0.06,
    "taxi": 0.16286,
    "park and ride": 0.10172,
    "tram": 0.05363,
    "bus": 0.10172,
    "train": 0.04885,
    "cycling": 0,
    "wheeling": 0,
    "walk": 0,
    "jogging": 0,
    "running": 0,
    "rowing": 0,
    "work from home": 0
  };

  /**
   * Carbon saving of the given mode
   */
  public getCarbonSaving(mode: string, distance: number): number {
    const referenceCost = this.carbonCostPerMile[this.referenceMode] * distance;
    const modeCostPerMile = this.carbonCostPerMile[mode.toLowerCase()] ?? 0;
    const cost = modeCostPerMile * distance;

    return referenceCost - cost;
  }

}
