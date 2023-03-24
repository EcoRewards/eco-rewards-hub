import { Connection } from "mysql2";
import { Logger } from "pino";
import autobind from "autobind-decorator";

@autobind
export class TrophyAllocationJob {

  private static TROPHIES = {
    "Bronze": 5000,
    "Silver": 10000,
    "Gold": 20000,
    "Platinum": 50000,
    "Sapphire": 70000,
    "Ruby": 100000,
    "Emerald": 150000,
    "Diamond": 200000
  };

  constructor(
    private readonly db: Connection,
    private readonly logger: Logger
  ) {}

  public async run() {
    const trophies = Object.entries(TrophyAllocationJob.TROPHIES);

    try {
      await Promise.all(trophies.map(this.allocateTrophy));
    } catch (e) {
      this.logger.error("Failed to allocate trophies");
      this.logger.error(e);
    }
  }

  private async allocateTrophy([trophy, points]: [string, number]) {
    return this.db.query(
      `INSERT INTO trophy (id, name, member_id , date_awarded, member_group_id, rewards, carbon_saving, miles) 
       SELECT null, ?, id, now(), member_group_id, rewards, carbon_saving, total_miles FROM member
       WHERE rewards >= ? 
       ON DUPLICATE KEY UPDATE miles=miles;`,
      [trophy, points]
    );
  }
}
