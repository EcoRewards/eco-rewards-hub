import { HttpResponse } from "../../service/controller/HttpResponse";
import { parse } from "csv-parse";
import { AdminUserId } from "../../user/AdminUser";
import { JourneyCsvToMySqlStreamFactory } from "../stream/JourneyCsvToMySqlStreamFactory";
import { JourneyRepository, JourneyWithGroupOrgAndScheme } from "../repository/JourneyRepository";
import { Context } from "koa";
import autobind from "autobind-decorator";
import { IncomingMessage } from "http";
import { MultiPartFormReader } from "./MultiPartFormReader";
import { JourneyViewFactory } from "../JourneyViewFactory";
import {
  GetAllResponse,
  GetResponse,
  PaginatedRequest,
  PaginatedResults
} from "../../service/controller/ReadController";
import { JourneyJsonView } from "../Journey";
import { LocalDate, LocalTime } from "@js-joda/core";
import ReadableStream = NodeJS.ReadableStream;
import { Filter } from "../../database/GenericRepository";

/**
 * /journeys endpoints
 */
@autobind
export class JourneysController {

  constructor(
    private readonly repository: JourneyRepository,
    private readonly factory: JourneyCsvToMySqlStreamFactory,
    private readonly formProcessor: MultiPartFormReader,
    private readonly viewFactory: JourneyViewFactory
  ) { }

  /**
   * Handler for the POST /journeys endpoint. Processes the input stream as a CSV of member
   * journeys and returns any errors generated during processing.
   */
  public async post(input: any, ctx: Context): Promise<HttpResponse<JourneysPostResponse>> {
    const errors = await this.processInput(ctx.req, ctx.adminUserId);

    return { data: { errors }, links: {} };
  }

  private async processInput(input: IncomingMessage, adminUserId: AdminUserId): Promise<string[]> {
    const [csvToMySql, form] = await Promise.all([
      this.factory.create(adminUserId),
      this.formProcessor.getForm(input)
    ]);

    const file = Object.values(form)[0] as ReadableStream;
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
  public async getAll(
    { page, quantity, filterText, filterField }: PaginatedRequest, ctx: Context
  ): Promise<GetAllResponse<JourneyJsonView> | void> {

    const links = {};
    const filter = filterField && filterText ? ({ text: filterText, field: filterField}) : undefined;

    const [{ rows, pagination }, view] = await Promise.all([
      this.getResults(page, quantity, filter),
      this.viewFactory.create()
    ]);

    const accepts = ctx.request.accept.types();

    if (accepts && accepts.includes("text/csv")) {
      const head = "source,uploaded,processed,travelDate,memberId,distance,mode,rewardsEarned,carbonSaving,deviceId,groupId,organisationId,schemeId\n";
      const csvData = rows
        .map(m => view.createCsv(links, m).join(","))
        .join("\n");

      ctx.set("Content-disposition", "attachment; filename=journeys.csv");
      ctx.status = 200;
      ctx.body = head + csvData;
    } else {
      const data = rows.map(m => view.create(links, m));

      return { data, links, pagination };
    }
  }

  private async getResults(
    page?: string, quantity?: string, filter?: Filter
  ): Promise<PaginatedResults<JourneyWithGroupOrgAndScheme>> {
    if (page && quantity) {
      const filters = filter ? [filter, { field: "member_id", text: filter.text }] : [];

      return this.repository.selectPaginated(+page, +quantity, filters);
    } else {
      const rows = await this.repository.selectAll();

      return { rows };
    }
  }

  /**
   * Return total miles, points earned and carbon savings by day.
   */
  public async getReport({ type, id, from, to }: ReportRequest): Promise<GetResponse<ReportJsonRow[]>> {
    const fromDate = from ? LocalDate.parse(from) : LocalDate.now().minusDays(7);
    const untilDate = to ? LocalDate.parse(to) : LocalDate.now();
    const report = await this.repository.selectJourneysGroupedByTravelDate(
      fromDate.toJSON(),
      untilDate.atTime(LocalTime.parse("23:59")).toJSON(),
      type,
      +id
    );

    const links = {};
    const itemNames = Object.keys(report);
    const data = [] as ReportJsonRow[];

    for (const name of itemNames) {
      for (let date = fromDate; !date.isAfter(untilDate); date = date.plusDays(1)) {
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
  id: string,
  from?: string,
  to?: string
}

export interface ReportJsonRow {
  date: string,
  name: string,
  totalDistance: number,
  totalRewardsEarned: number,
  totalCarbonSaving: number
}
