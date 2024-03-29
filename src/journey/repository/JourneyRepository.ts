import { Readable } from "stream";
import { Journey, NonNullId } from "../..";
import { setNested } from "ts-array-utils";
import { Filter, PaginatedRows } from "../../database/GenericRepository";

const fields = `
  journey.*, 
  IFNULL(smartcard, member_id) AS member_id, 
  member_group.name AS group_id, 
  organisation.name AS organisation_id, 
  scheme.name AS scheme_id
`;

const joins = `
  JOIN member ON member.id = member_id 
  JOIN member_group ON member.member_group_id = member_group.id 
  JOIN organisation ON member_group.organisation_id = organisation.id 
  JOIN scheme ON organisation.scheme_id = scheme.id 
`;

/**
 * Provides access to the journey table
 */
export class JourneyRepository {
  private readonly subTable = {
    "global": "scheme",
    "scheme": "organisation",
    "organisation": "member_group"
  };

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
        @carbon_saving,
        @device_id,
        @latitude,
        @longitude,
        @type
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
        carbon_saving = nullif(@carbon_saving, ''),
        device_id = @device_id,
        latitude = @latitude,
        longitude = @longitude,
        type = @type
    `;

    const infileStreamFactory = () => input;

    return new Promise((resolve, reject) => {
      this.stream.query({ sql, infileStreamFactory }, err => err ? reject(err) : resolve());
    });
  }

  /**
   * Select all rows from the journey table and replace the member ID with the smartcard number if it's set
   */
  public async selectLast18Months(): Promise<JourneyWithGroupOrgAndScheme[]> {
    const [rows] = await this.db.query(`
      SELECT ${fields}
      FROM journey 
      ${joins}
      WHERE journey.travel_date > DATE_SUB(NOW(), INTERVAL 18 MONTH)
      ORDER BY journey.id DESC 
    `);

    return rows;
  }

  /**
   * Select paginated data from the table
   */
  public async selectPaginated(
    page: number, perPage: number, filters: Filter[]
  ): Promise<PaginatedRows<JourneyWithGroupOrgAndScheme>> {

    const where = filters.length > 0 ? "WHERE " + filters.map(() => "?? LIKE ?").join(" OR ") : "";
    const args = filters.flatMap(filter => [filter.field, filter.text + "%"]);
    const limit = `ORDER BY id DESC LIMIT ${(page - 1) * perPage}, ${perPage}`;

    const [[rows], [[count]]] = await Promise.all([
      this.db.query(`SELECT ${fields} FROM journey ${joins} ${where} ${limit}`, args),
      this.db.query(`SELECT COUNT(*) FROM journey ${joins} ${where}`, args)
    ]);

    return { rows, pagination: { count: count["COUNT(*)"] } };
  }

  /**
   * Select journey data grouped by travel date and limited to a scope of scheme, organisation or group.
   */
  public async selectJourneysGroupedByTravelDate(
    from: string,
    to: string,
    scope: QueryScope,
    id?: number,
  ): Promise<ReportRowsIndexed> {
    const subTable = this.subTable[scope];
    const dateClause = "travel_date BETWEEN ? AND ?";
    const subIdClause = scope === "global" ? "" : `AND ${scope}.id = ?`;

    const [rows]: ReportRow[][] = await this.db.query(`
      SELECT
        ${subTable}.name as sub_name,
        DATE(travel_date) as date,
        SUM(journey.distance) AS total_distance,
        SUM(journey.rewards_earned) AS total_rewards_earned,
        SUM(journey.carbon_saving) AS total_carbon_saving
      FROM member
      JOIN member_group on member_group.id = member_group_id
      JOIN organisation on organisation.id = organisation_id
      JOIN scheme on scheme.id = scheme_id
      JOIN journey on member.id = member_id
      WHERE ${dateClause} ${subIdClause}
      GROUP BY CONCAT(sub_name, DATE(travel_date));
    `, [from, to, id]);

    return rows.reduce((index, row) => setNested(row, index, row.sub_name, row.date), {});
  }

}

export type QueryScope = "global" | "scheme" | "organisation";
export interface ReportRow {
  sub_name: string,
  date: string,
  total_distance: number,
  total_rewards_earned: number,
  total_carbon_saving: number
}

export type ReportRowsIndexed = Record<string, Record<string, ReportRow>>;

export type JourneyWithGroupOrgAndScheme = NonNullId<Journey> & {
  group_id: string,
  organisation_id: string,
  scheme_id: string
};
