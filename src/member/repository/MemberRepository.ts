import { Member } from "../Member";
import { NonNullId } from "../../database/GenericRepository";

/**
 * Access to the member table
 */
export class MemberRepository {

  constructor(
    private readonly db: any
  ) {}

  /**
   * Select a Member by their smart card number
   */
  public async selectBySmartcard(smartcard: string): Promise<NonNullId<Member> | undefined> {
    const [[row]] = await this.db.query("SELECT * FROM member WHERE smartcard = ?", [smartcard]);

    return row;
  }

}
