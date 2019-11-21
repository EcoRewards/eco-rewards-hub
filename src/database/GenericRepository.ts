
/**
 * Generic access to the database
 */
export class GenericRepository {

  constructor(
    private readonly db: any
  ) {}

  /**
   * Save the given record using an UPSERT. If the record is inserted it will be returned with an id.
   */
  public async save<T extends DatabaseRecord>(table: string, record: T): Promise<T> {
    const keysWithoutId = Object.keys(record).filter(k => k !== "id");
    const updateSql = keysWithoutId.map(k => k + " = ?").join();
    const updateValues = keysWithoutId.map(k => record[k]);
    const insertValues = Object.values(record);
    const insertSql = new Array(insertValues.length).fill("?").map(() => "?").join();

    const [result] = await this.db.query(
      `INSERT INTO ${table} VALUES (${insertSql}) ON DUPLICATE KEY UPDATE ${updateSql}`,
      [...insertValues, ...updateValues]
    );

    const id = record.id || result.insertId;

    return { ...record, id };
  }

  /**
   * Select all rows from the given table
   */
  public async selectAll<T extends DatabaseRecord>(table: string): Promise<NonNullId<T>[]> {
    const [rows] = await this.db.query(`SELECT * FROM ${table}`);

    return rows;
  }

}

export interface DatabaseRecord {
  id: number | null
}

export interface SavedDatabaseRecord {
  id: number
}

export type NonNullId<T extends DatabaseRecord> = T & SavedDatabaseRecord;
