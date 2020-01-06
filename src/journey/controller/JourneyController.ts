import { HttpResponse } from "../../service/controller/HttpResponse";
import * as parse from "csv-parse";
import { AdminUserId } from "../../user/AdminUser";
import { JourneyCsvToMySqlStreamFactory } from "../stream/JourneyCsvToMySqlStreamFactory";
import { JourneyRepository } from "../repository/JourneyRepository";
import { Context } from "koa";
import autobind from "autobind-decorator";
import { IncomingMessage } from "http";
import { MultiPartFileExtractor } from "./MultiPartFileExtractor";
import { JourneyViewFactory } from "../JourneyViewFactory";
import { GetAllResponse } from "../../service/controller/ReadController";
import { JourneyJsonView } from "../Journey";

/**
 * Journey endpoints
 */
@autobind
export class JourneyController {

  constructor(
    private readonly repository: JourneyRepository,
    private readonly factory: JourneyCsvToMySqlStreamFactory,
    private readonly fileExtractor: MultiPartFileExtractor,
    private readonly viewFactory: JourneyViewFactory
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

  /**
   * Return a list of items
   */
  public async getAll(): Promise<GetAllResponse<JourneyJsonView>> {
    const links = {};
    const [models, view] = await Promise.all([
      this.repository.selectAll(),
      this.viewFactory.create()
    ]);

    const data = models.map(m => view.create(links, m));

    return { data, links };
  }

}

export interface JourneyPostResponse {
  errors: string[]
}
