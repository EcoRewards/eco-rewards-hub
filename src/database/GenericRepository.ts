import { indexBy } from "ts-array-utils";

/**
 * Generic access to the database
 */
export class GenericRepository<T extends DatabaseRecord> {

  constructor(
    private readonly db: any,
    private readonly table: string,
    private readonly relations: Record<string, string> = {}
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
    const insertSql = new Array(insertValues.length).fill("?").join();

    const [result] = await this.db.query(
      `INSERT INTO ${this.table} (${keys.join()}) VALUES (${insertSql}) ON DUPLICATE KEY UPDATE ${updateSql}`,
      [...insertValues, ...updateValues]
    );

    const id = record.id || result.insertId;

    return { ...record, id };
  }

  /**
   * Insert a number of records
   */
  public async insertAll(records: T[]): Promise<NonNullId<T>[]> {
    if (records.length === 0) {
      return [];
    }

    const record = records[0];
    const keys = Object.keys(record);
    const insertValues = records.flatMap(r => Object.values(r));
    const insertOneRow = new Array(keys.length).fill("?").join();
    const insertMultipleRows = new Array(records.length).fill("(" + insertOneRow + ")").join();

    const [result] = await this.db.query(
      `INSERT INTO ${this.table} (${keys.join()}) VALUES ${insertMultipleRows}`, insertValues
    );

    // assuming that the id field is an auto_increment we can calculate the new ids
    return records.map((originalRecord, i) => ({
      ...originalRecord,
      id: result.insertId + i
    }));
  }

  /**
   * Select all rows from the given table
   */
  public async selectAll(): Promise<NonNullId<T>[]> {
    const [rows] = await this.db.query(`SELECT * FROM ${this.table} ORDER BY id DESC`);

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
   * Select any rows that match any of the given IN () clauses
   */
  public async selectIn(...clauses: [string, string[] | number[]][]): Promise<NonNullId<T>[]> {
    const clauseSql = clauses
      .map(([field, values]) => `${field} IN (${new Array(values.length).fill("?").join()})`)
      .join(" OR ");

    const queryValues = clauses
      .map(([_, values]) => values)
      .flat();

    const [rows] = await this.db.query(`SELECT * FROM ${this.table} WHERE ${clauseSql}`, queryValues);

    return rows;
  }

  /**
   * Get an index of scheme id to scheme
   */
  public async getIndexedById(): Promise<Record<number, NonNullId<T>>> {
    const rows = await this.selectAll();

    return rows.reduce(indexBy(r => r.id), {});
  }

  /**
   * Delete the record and clean up any related tables by defaulting them to 1
   */
  public async deleteOne(id: number): Promise<void> {
    const connection = await this.db.getConnection();
    await connection.beginTransaction();

    try {
      await this.db.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);

      for (const [table, column] of Object.entries(this.relations)) {
        await connection.query(`UPDATE ${table} SET ${column} = 1 WHERE ${column} = ?`, [id]);
      }

      await connection.commit();
    }
    catch (err) {
      await connection.rollback();
    }
    finally {
      await connection.release();
    }
  }

  /**
   * Update a number of records in the given ID range
   */
  public async updateRange(startId: number, endId: number, data: Partial<Omit<T, "id">>): Promise<void> {
    const cols = Object.keys(data).map(k => `${k} = ?`).join();
    const values = Object.values(data);

    await this.db.query(`UPDATE ${this.table} SET ${cols} WHERE id >= ${+startId} AND id <= ${+endId}`, values);
  }

}

export interface DatabaseRecord {
  id: number | null
}

export interface SavedDatabaseRecord {
  id: number
}

export type NonNullId<T extends DatabaseRecord> = T & SavedDatabaseRecord;
