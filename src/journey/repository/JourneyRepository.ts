import { Readable } from "stream";
import { Journey, NonNullId } from "../..";

/**
 * Provides access to the journey table
 */
export class JourneyRepository {

  constructor(
    private readonly stream: any,
    private readonly db: any
  ) {}

  /**
   * Sends the given stream to a table
   */
  public async insertStream(input: Readable): Promise<void> {
    const sql = `
      LOAD DATA LOCAL INFILE 'stream' 
      INTO TABLE journey 
      FIELDS TERMINATED BY ','
      (
        @id,
        @admin_user_id,
        @uploaded,
        @processed,
        @travel_date,
        @member_id,
        @distance,
        @mode,
        @rewards_earned,
        @carbon_saving
      )
      SET
        id = null,
        admin_user_id = nullif(@admin_user_id, ''),
        uploaded = nullif(@uploaded, ''),
        processed = nullif(@processed, ''),
        travel_date = nullif(@travel_date, ''),
        member_id = nullif(@member_id, ''),
        distance = nullif(@distance, ''),
        mode = nullif(@mode, ''),
        rewards_earned = nullif(@rewards_earned, ''),
        carbon_saving = nullif(@carbon_saving, '')
    `;

    const infileStreamFactory = () => input;

    return new Promise((resolve, reject) => {
      this.stream.query({ sql, infileStreamFactory }, err => err ? reject(err) : resolve());
    });
  }

  /**
   * Select all rows from the journey table and replace the member ID with the smartcard number if it's set
   */
  public async selectAll(): Promise<NonNullId<Journey>[]> {
    const [rows] = await this.db.query(`
      SELECT *, IFNULL(smartcard, member_id) AS member_id 
      FROM journey JOIN member ON member.id = member_id 
      ORDER BY journey.id DESC 
      LIMIT 10000
    `);

    return rows;
  }

}
