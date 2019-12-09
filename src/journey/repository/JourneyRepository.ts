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
    const sql = "LOAD DATA LOCAL INFILE 'stream' INTO TABLE journey";

    return new Promise(resolve => {
      this.db.query({ sql, infileStreamFactory: () => input }, resolve);
    });
  }

}