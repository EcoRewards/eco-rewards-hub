import { HttpResponse } from "../../service/controller/HttpResponse";
import * as parse from "csv-parse";
import { AdminUserId } from "../../user/AdminUser";
import { JourneyCsvToMySqlStreamFactory } from "../JourneyCsvToMySqlStreamFactory";
import { JourneyStreamRepository } from "../repository/JourneyStreamRepository";
import { Context } from "koa";
import autobind from "autobind-decorator";
import { IncomingMessage } from "http";
import { MultiPartFileExtractor } from "./MultiPartFileExtractor";

/**
 * Journey endpoints
 */
@autobind
export class JourneyController {

  constructor(
    private readonly repository: JourneyStreamRepository,
    private readonly factory: JourneyCsvToMySqlStreamFactory,
    private readonly fileExtractor: MultiPartFileExtractor
  ) { }

  /**
   * Handler for the POST /journey endpoint. Processes the input stream as a CSV of member
   * journeys and returns any errors generated during processing.
   */
  public async post(input: any, ctx: Context): Promise<HttpResponse<JourneyPostResponse>> {
    const errors = await this.processInput(ctx.req, ctx.adminUserId);

    return { data: { errors }, links: {} };
  }

  private async processInput(input: IncomingMessage, adminUserId: AdminUserId): Promise<string[]> {
    const [csvToMySql, file] = await Promise.all([
      this.factory.create(adminUserId),
      this.fileExtractor.getFile(input)
    ]);

    const inserts = file
      .pipe(parse({ bom: true, skip_empty_lines: true }))
      .pipe(csvToMySql);

    try {
      await this.repository.insertStream(inserts);

      return csvToMySql.getErrors();
    }
    catch (err) {
      return csvToMySql.getErrors().concat(err.message);
    }
  }

}

export interface JourneyPostResponse {
  errors: string[]
}
