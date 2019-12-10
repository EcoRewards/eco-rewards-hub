import { Readable } from "stream";

/**
 * Provides access to the journey table
 */
export class JourneyRepository {

  constructor(
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
      this.db.query({ sql, infileStreamFactory }, err => err ? reject(err) : resolve());
    });
  }

}