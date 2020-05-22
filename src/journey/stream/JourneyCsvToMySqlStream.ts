import { JourneyFactory } from "../JourneyFactory";
import { AdminUserId } from "../../user/AdminUser";
import { Transform, TransformCallback } from "stream";

/**
 * Transforms CSV rows into MySQL rows
 */
export class JourneyCsvToMySqlStream extends Transform {
  private errors: string[] = [];

  constructor(
    private factory: JourneyFactory,
    private readonly adminUserId: AdminUserId
  ) {
    super({ objectMode: true });
  }

  /**
   * Use the factory to create a journey then send the values onward. Any errors generated
   * along the way are captured and stored in the errors array.
   */
  public async _transform(row: any, encoding: string, callback: TransformCallback): Promise<void> {
    let journey;

    try {
      journey = await this.factory.create(row, this.adminUserId);
    }
    catch (err) {
      this.errors.push(err.message);

      return callback();
    }

    const mysqlRow = Object.values(journey).join() + "\n";
    callback(null, Buffer.from(mysqlRow));
  }

  public getErrors(): string[] {
    return this.errors;
  }

}
