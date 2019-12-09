import { Readable } from "stream";
import { HttpResponse } from "../../service/controller/HttpResponse";
import * as parse from "csv-parse";
import { AdminUserId } from "../../user/AdminUser";
import { JourneyCsvToMySqlStreamFactory } from "../JourneyCsvToMySqlStreamFactory";
import streamToPromise = require("stream-to-promise");
import { JourneyRepository } from "../repository/JourneyRepository";
import { Context } from "koa";

/**
 * Journey endpoints
 */
export class JourneyController {

  constructor(
    private readonly repository: JourneyRepository,
    private readonly factory: JourneyCsvToMySqlStreamFactory
  ) { }

  /**
   * Handler for the POST /journey endpoint. Processes the input stream as a CSV of member
   * journeys and returns any errors generated during processing.
   */
  public async post(input: any, ctx: Context): Promise<HttpResponse<JourneyPostResponse>> {
    const errors = await this.processInput(ctx.request.body, ctx.adminUserId);

    return { data: { errors }, links: {} };
  }

  private async processInput(input: Readable, adminUserId: AdminUserId): Promise<string[]> {
    const csvToMySql = await this.factory.create(adminUserId);
    const inserts = input
      .pipe(parse({ bom: true }))
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
