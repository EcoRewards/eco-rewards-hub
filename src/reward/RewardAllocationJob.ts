import { JourneyProcessedRow, RewardRepository, SavedJourney, TravelDate } from "./RewardRepository";
import { CarbonSavingPolicy } from "./CarbonSavingPolicy";
import { RewardPointPolicy } from "./RewardPointPolicy";
import autobind from "autobind-decorator";

/**
 * Period job that selects an journeys that have not been processed and allocates rewards accordingly.
 */
@autobind
export class RewardAllocationJob {

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
    const existingRewards = await this.repository.selectMemberRewardsGeneratedOn(memberId, date);
    const journeysProcessed: JourneyProcessedRow[] = [];

    let rewardsGenerated = 0;
    let carbonSavingGenerated = 0;

    for (const journey of journeys) {
      const carbonSaving = this.carbonSavingPolicy.getCarbonSaving(journey.mode, journey.distance);
      const currentTotal = existingRewards + rewardsGenerated;
      const rewardPoints = this.rewardPointPolicy.getRewardPoints(journey.mode, journey.distance, currentTotal);

      journeysProcessed.push([rewardPoints, carbonSaving, journey.id]);
      rewardsGenerated += rewardPoints;
      carbonSavingGenerated += carbonSaving;
    }

    await this.repository.updateRewards(memberId, journeysProcessed, rewardsGenerated, carbonSavingGenerated);
  }
}
