import { Member } from "../Member";
import { NonNullId } from "../../database/GenericRepository";
import { MinimumMemberJsonView } from "../MemberModelFactory";

/**
 * Access to the member table
 */
export class MemberRepository {

  constructor(
    private readonly db: any,
    private readonly table: string
  ) {}

  public async selectBySmartcard(smartcard: string): Promise<NonNullId<Member> | undefined> {
    const [[row]] = await this.db.query("SELECT * FROM member WHERE smartcard = ?", [smartcard]);

    return row;
  }

  /**
   * Select a row from the given table
   */
  public async selectOne(id: number): Promise<NonNullId<Member> | undefined> {
    const [rows] = await this.db.query(`SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`, [id]);

    return rows[0];
  }

  /**
   * Save the given record using an UPSERT. If the record is inserted it will be returned with an id.
   */
  public async save(record: PartialMemberJsonView): Promise<NonNullId<any>> {
    const keys = Object.keys(record);
    const keysWithoutId = keys.filter(k => k !== "id");
    const updateSql = keysWithoutId.map(k => k + " = ?").join();
    const updateValues = keysWithoutId.map(k => record[k]);
    const insertValues = Object.values(record);
    const insertSql = new Array(insertValues.length).fill("?").join();

    console.log(`INSERT INTO ${this.table} (${keys.join()}) VALUES (${insertSql}) ON DUPLICATE KEY UPDATE ${updateSql}`,
        [...insertValues, ...updateValues])
    const [result] = await this.db.query(
        `INSERT INTO ${this.table} (${keys.join()}) VALUES (${insertSql}) ON DUPLICATE KEY UPDATE ${updateSql}`,
        [...insertValues, ...updateValues]
    );

    const id = record.id || result.insertId;
    const member = { ...this.selectOne(id), ...record };

    return { member, id };
  }
}

export interface PartialMemberJsonView {
  id: number;
  default_transport_mode: string;
  default_distance: number;
}
