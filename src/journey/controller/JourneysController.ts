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
import { GetAllResponse, GetResponse } from "../../service/controller/ReadController";
import { JourneyJsonView } from "../Journey";
import { LocalDate } from "@js-joda/core";
import { indexBy } from "ts-array-utils";

/**
 * /journeys endpoints
 */
@autobind
export class JourneysController {

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
  public async post(input: any, ctx: Context): Promise<HttpResponse<JourneysPostResponse>> {
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

  /**
   * Return total miles, points earned and carbon savings by day.
   */
  public async getReport({ type, id }: ReportRequest): Promise<GetResponse<ReportJsonRow[]>> {
    const from = LocalDate.now().minusDays(7);
    const until = LocalDate.now();
    const parsedId = id ? +id : undefined;
    const report = await this.repository.selectJourneysGroupedByTravelDate(
      from.toJSON(),
      until.toJSON(),
      type,
      parsedId
    );

    const links = {};
    const itemNames = Object.keys(report);
    const data = [] as ReportJsonRow[];

    for (const name of itemNames) {
      for (let date = from; !date.isAfter(until); date = date.plusDays(1)) {
        const dateString = date.toJSON();
        data.push({
          date: dateString,
          name: name,
          totalDistance: +(report[name]?.[dateString]?.total_distance) || 0,
          totalRewardsEarned: +(report[name]?.[dateString]?.total_rewards_earned) || 0,
          totalCarbonSaving: +(report[name]?.[dateString]?.total_carbon_saving) || 0
        });
      }
    }

    return { data, links };
  }

}

export interface JourneysPostResponse {
  errors: string[]
}

export interface ReportRequest {
  type: "global" | "scheme" | "organisation",
  id?: string
}

export interface ReportJsonRow {
  date: string,
  name: string,
  totalDistance: number,
  totalRewardsEarned: number,
  totalCarbonSaving: number
}
