import { MemberId } from "../member/Member";
import { pushNested } from "ts-array-utils";
import { Logger } from "pino";
import { SavedJourney } from "../journey/TapProcessor";

/**
 * Database queries specific to reward allocation. These span the journey and member tables.
 */
export class RewardRepository {

  constructor(
    private readonly db: any,
    private readonly logger: Logger
  ) { }

  /**
   * Get the unprocessed journeys and then index them by member ID and travel date
   */
  public async selectUnprocessedJourneysIndexedByMemberAndDate(): Promise<UnprocessedJourneyIndex> {
    const [rows] = await this.db.query("SELECT *, DATE(travel_date) AS travel_date FROM journey WHERE processed IS NULL LIMIT 1000");

    return rows.reduce((index, row) => pushNested(row, index, row.member_id, row.travel_date), {});
  }

  /**
   * Return the number of rewards a given user has generated in a day
   */
  public async selectMemberRewardsGeneratedOn(memberId: number, date: string): Promise<MemberPreviousJourneys> {
    const [rows] = await this.db.query(
      `SELECT 
        SUM(rewards_earned) AS amount,
        GROUP_CONCAT(IF(device_id="", "none", device_id)) AS devices
       FROM journey 
       WHERE member_id = ? 
       AND processed IS NOT NULL
       AND DATE(travel_date) = ?`,
      [memberId, date]
    );

    const existingRewards = rows[0] ? +rows[0].amount : 0;
    const devices = rows[0] && rows[0].devices ? rows[0].devices.split(",") : [];

    return { existingRewards, devices };
  }

  /**
   * Use a transaction to update the members rewards and carbon saving and set the journeys to be processed.
   */
  public async updateRewards(
    memberId: MemberId,
    journeysProcessed: any[],
    rewardsGenerated: number,
    carbonSavingGenerated: number,
    totalMiles: number
  ): Promise<void> {
    const connection = await this.db.getConnection();
    await connection.beginTransaction();

    try {
      const memberUpdate = connection.query(
        `UPDATE member SET 
           rewards = rewards + ?, 
           carbon_saving = carbon_saving + ?,
           total_miles = total_miles + ?
         WHERE id = ?`,
        [rewardsGenerated, carbonSavingGenerated, totalMiles, memberId]
      );

      const journeyUpdates = journeysProcessed.map(journey => {
        return connection.query(
          "UPDATE journey SET processed = NOW(), distance = ?, rewards_earned = ?, carbon_saving = ? WHERE id = ?",
          journey
        );
      });

      await Promise.all([memberUpdate, ...journeyUpdates]);
      await connection.commit();
    }
    catch (err) {
      this.logger.warn("Error processing journeys, rolling back transaction");
      this.logger.warn(err);

      await connection.rollback();
    }
    finally {
      await connection.release();
    }
  }
}

export type TravelDate = string;
export type UnprocessedJourneyIndex = Record<MemberId, Record<TravelDate, SavedJourney[]>>;
export type JourneyProcessedRow = [number, number, number, number];
export type MemberPreviousJourneys = {
  existingRewards: number,
  devices: string[]
};
