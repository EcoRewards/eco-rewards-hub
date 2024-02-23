import { NonNullId } from "../..";
import { Filter, PaginatedRows } from "../../database/GenericRepository";
import { Trophy } from "../Trophy";

const fields = `
  trophy.*, 
  IFNULL(smartcard, member_id) AS member_id, 
  member_group.name AS member_group_id
`;

const joins = `
  JOIN member ON member.id = member_id 
  JOIN member_group ON member.member_group_id = member_group.id 
`;

/**
 * Provides access to the trophy table
 */
export class TrophyRepository {

  constructor(
    private readonly db: any
  ) {}

  /**
   * Select all rows from the trophy table
   */
  public async selectAll(): Promise<NonNullId<Trophy>[]> {
    const [rows] = await this.db.query(`
      SELECT ${fields}
      FROM trophy 
      ${joins}
    `);

    return rows;
  }

  /**
   * Select paginated data from the table
   */
  public async selectPaginated(
    page: number, perPage: number, filters: Filter[]
  ): Promise<PaginatedRows<NonNullId<Trophy>>> {

    const where = filters.length > 0 ? "WHERE " + filters.map(() => "?? LIKE ?").join(" OR ") : "";
    const args = filters.flatMap(filter => [filter.field, filter.text + "%"]);
    const limit = `ORDER BY id DESC LIMIT ${(page - 1) * perPage}, ${perPage}`;

    const [[rows], [[count]]] = await Promise.all([
      this.db.query(`SELECT ${fields} FROM trophy ${joins} ${where} ${limit}`, args),
      this.db.query(`SELECT COUNT(*) FROM trophy ${joins} ${where}`, args)
    ]);

    return { rows, pagination: { count: count["COUNT(*)"] } };
  }

}
