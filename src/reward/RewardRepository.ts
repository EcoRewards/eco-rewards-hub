import { MemberId } from "../member/Member";
import { Journey } from "../journey/Journey";
import { Connection } from "mysql";
import { NonNullId } from "..";
import { pushNested } from "ts-array-utils";

/**
 * Database queries specific to reward allocation. These span the journey and member tables.
 */
export class RewardRepository {

  constructor(
    private readonly db: any
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
  public async selectMemberRewardsGeneratedOn(memberId: number, date: string): Promise<number> {
    const [{ amount }] = await this.db.query(
      "SELECT SUM(rewards_earned) AS amount FROM journey WHERE member_id = ? AND DATE(processed) = ? ",
      [memberId, date]
    );

    return amount || 0;
  }

  /**
   * Use a transaction to update the members rewards and carbon saving and set the journeys to be processed.
   */
  public async updateRewards(
    memberId: MemberId,
    journeysProcessed: any[],
    rewardsGenerated: number,
    carbonSavingGenerated: number
  ): Promise<void> {
    const connection = await this.db.getConnection();
    await connection.beginTransaction();

    try {
      const memberUpdate = connection.query(
        "UPDATE member SET rewards = rewards + ?, carbon_saving = carbon_saving + ? WHERE id = ?",
        [rewardsGenerated, carbonSavingGenerated, memberId]
      );

      const journeyUpdates = journeysProcessed.map(journey => {
        return connection.query(
          "UPDATE journey SET processed = NOW(), rewards_earned = ?, carbon_saving = ? WHERE id = ?", journey
        );
      });

      await Promise.all([memberUpdate, ...journeyUpdates]);
      await connection.commit();
    }
    catch (err) {
      await connection.rollback();
    }
    finally {
      await connection.release();
    }
  }
}

export type SavedJourney = NonNullId<Journey>;
export type TravelDate = string;
export type UnprocessedJourneyIndex = Record<MemberId, Record<TravelDate, SavedJourney[]>>;
export type JourneyProcessedRow = [number, number, number];
