import { Scheme } from "./Scheme";
import { NonNullId } from "../database/GenericRepository";

/**
 * Provides access to schemes in the database
 */
export class SchemeRepository {

  constructor(
    private readonly db: any
  ) {}

  /**
   * Get an index of scheme id to scheme
   */
  public async getSchemeIndex(): Promise<SchemeIndex> {
    const [schemes] = await this.db.query("SELECT * FROM scheme");

    return schemes.reduce(this.indexById, {});
  }

  private indexById(index: SchemeIndex, item: NonNullId<Scheme>): SchemeIndex {
    index[item.id] = item;

    return index;
  }

}

/**
 * Schemes indexed by id
 */
export type SchemeIndex = Record<number, Scheme>;
