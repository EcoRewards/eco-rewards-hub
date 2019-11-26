import { indexBy } from "ts-array-utils";

/**
 * Generic access to the database
 */
export class GenericRepository<T extends DatabaseRecord> {

  constructor(
    private readonly db: any,
    private readonly table: string
  ) {}

  /**
   * Save the given record using an UPSERT. If the record is inserted it will be returned with an id.
   */
  public async save(record: T): Promise<NonNullId<T>> {
    const keys = Object.keys(record);
    const keysWithoutId = keys.filter(k => k !== "id");
    const updateSql = keysWithoutId.map(k => k + " = ?").join();
    const updateValues = keysWithoutId.map(k => record[k]);
    const insertValues = Object.values(record);
    const insertSql = new Array(insertValues.length).fill("?").map(() => "?").join();

    const [result] = await this.db.query(
      `INSERT INTO ${this.table} (${keys.join()}) VALUES (${insertSql}) ON DUPLICATE KEY UPDATE ${updateSql}`,
      [...insertValues, ...updateValues]
    );

    const id = record.id || result.insertId;

    return { ...record, id };
  }

  /**
   * Select all rows from the given table
   */
  public async selectAll(): Promise<NonNullId<T>[]> {
    const [rows] = await this.db.query(`SELECT * FROM ${this.table}`);

    return rows;
  }

  /**
   * Select a row from the given table
   */
  public async selectOne(id: number): Promise<NonNullId<T> | undefined> {
    const [rows] = await this.db.query(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [id]);

    return rows[0];
  }

  /**
   * Get an index of scheme id to scheme
   */
  public async getIndexedById(): Promise<Record<number, T>> {
    const rows = await this.selectAll();

    return rows.reduce(indexBy(r => r.id), {});
  }

}

export interface DatabaseRecord {
  id: number | null
}

export interface SavedDatabaseRecord {
  id: number
}

export type NonNullId<T extends DatabaseRecord> = T & SavedDatabaseRecord;
