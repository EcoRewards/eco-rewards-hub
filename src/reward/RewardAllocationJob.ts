import { JourneyProcessedRow, RewardRepository, TravelDate } from "./RewardRepository";
import { CarbonSavingPolicy } from "./CarbonSavingPolicy";
import { RewardPointPolicy } from "./RewardPointPolicy";
import autobind from "autobind-decorator";
import { setNested } from "ts-array-utils";
import { SavedJourney } from "../journey/TapProcessor";

/**
 * Period job that selects an journeys that have not been processed and allocates rewards accordingly.
 */
@autobind
export class RewardAllocationJob {
  private readonly deviceIdGroups = {
    "01345456": "SWR"
  };

  constructor(
    private readonly repository: RewardRepository,
    private readonly carbonSavingPolicy: CarbonSavingPolicy,
    private readonly rewardPointPolicy: RewardPointPolicy
  ) { }

  /**
   * Run the job to calculate reward points and carbon savings
   */
  public async run(): Promise<void> {
    const unprocessedJourneys = await this.repository.selectUnprocessedJourneysIndexedByMemberAndDate();
    const journeyProcessingPromises = Object.values(unprocessedJourneys).map(this.processMemberTravel);

    await Promise.all(journeyProcessingPromises);
  }

  private async processMemberTravel(travel: Record<TravelDate, SavedJourney[]>): Promise<void> {
    const promises = Object.entries(travel).map(entry => this.processMemberTravelOnDate(...entry));

    await Promise.all(promises);
  }

  private async processMemberTravelOnDate(date: string, journeys: SavedJourney[]): Promise<void> {
    const memberId = journeys[0].member_id;
    const { devices, existingRewards } = await this.repository.selectMemberRewardsGeneratedOn(memberId, date);
    const usedDeviceGroups = devices.reduce((index, id) => setNested(true, index, this.getDeviceGroup(id)), {});
    const journeysProcessed: JourneyProcessedRow[] = [];

    let rewardsGenerated = 0;
    let carbonSavingGenerated = 0;
    let totalDistance = 0;

    for (const journey of journeys) {
      const deviceGroup = this.getDeviceGroup(journey.device_id);
      const hasUsedThisDeviceGroup = usedDeviceGroups[deviceGroup];

      if (hasUsedThisDeviceGroup && journey.device_id !== "") {
        journeysProcessed.push([0, 0, 0, journey.id]);
      }
      else {
        const carbonSaving = this.carbonSavingPolicy.getCarbonSaving(journey.mode, journey.distance);
        const currentTotal = existingRewards + rewardsGenerated;
        const rewardPoints = this.rewardPointPolicy.getRewardPoints(journey.mode, journey.distance, currentTotal);

        journeysProcessed.push([journey.distance, rewardPoints, carbonSaving, journey.id]);
        rewardsGenerated += rewardPoints;
        carbonSavingGenerated += carbonSaving;
        totalDistance += journey.distance;
        usedDeviceGroups[deviceGroup] = true;
      }
    }

    await this.repository.updateRewards(
      memberId,
      journeysProcessed,
      rewardsGenerated,
      carbonSavingGenerated,
      totalDistance
    );
  }

  private getDeviceGroup(deviceId: string) {
    return deviceId === "none" ? "none" : this.deviceIdGroups[deviceId] || "unknown";
  }
}
