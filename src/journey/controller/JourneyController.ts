import { HttpResponse } from "../../service/controller/HttpResponse";
import { JourneyJsonView, Journey } from "../Journey";
import { Base64 } from "js-base64";
import { TapReader } from "../TapReader";
import { JourneyFactory } from "../JourneyFactory";
import { Context } from "koa";
import { JourneyViewFactory } from "../JourneyViewFactory";
import { GenericRepository } from "../../database/GenericRepository";
import { AdminUserId, JourneyCsvToMySqlStream, Member } from "../..";
import { indexBy } from "ts-array-utils";
import autobind from "autobind-decorator";
import { LocalDateTime, ZoneId, DateTimeFormatter } from "@js-joda/core";
import { AxiosInstance } from "axios";
import { Logger } from "pino";
import btoa = require("btoa");

/**
 * Endpoint for receiving LORaWAN data from The Things API
 */
@autobind
export class JourneyController {
  private readonly dateFormat = DateTimeFormatter.ofPattern("yyyyMMDDHHmm");
  private readonly statusResponseCommand = Buffer.from("SETDT");

  constructor(
    private readonly tapReader: TapReader,
    private readonly viewFactory: JourneyViewFactory,
    private readonly journeyRepository: GenericRepository<Journey>,
    private readonly memberRepository: GenericRepository<Member>,
    private readonly http: AxiosInstance,
    private readonly logger: Logger
  ) {}

  /**
   * Get an index of members and create a new JourneyFactory for the JourneyCsvToMySqlStream
   */
  public async getFactory(): Promise<JourneyFactory> {
    const members = await this.memberRepository.getIndexedById();
    const membersBySmartcard = Object.values(members).reduce(indexBy(m => m.smartcard || ""), {});

    return new JourneyFactory(members, membersBySmartcard);
  }

  /**
   * Read the raw payload and store the journeys.
   */
  public post(request: JourneyPostRequest, ctx: Context): Promise<HttpResponse<JourneyJsonView[]>> {
    const buffer = Buffer.from(request.payload_raw, "base64");

    if (buffer[8] === 0x20) {
      this.logger.info("Status message: " + Array.from(buffer).map(byte => byte.toString(16).padStart(2, "0")));

      return this.processStatus(request);
    }
    else {
      return this.processTaps(buffer, ctx);
    }
  }

  private async processTaps(buffer: Buffer, ctx: Context): Promise<HttpResponse<JourneyJsonView[]>> {
    const taps = this.tapReader.getTaps(buffer);
    const factory = await this.getFactory();
    const journeys = Object.entries(taps).map(t => factory.create(t, ctx.adminUserId));
    const savedJourneys = await this.journeyRepository.insertAll(journeys);
    const view = await this.viewFactory.create();
    const links = {};
    const data = savedJourneys.map(j => view.create(links, j));

    return { data, links };
  }

  private async processStatus(request: JourneyPostRequest): Promise<HttpResponse<JourneyJsonView[]>> {
    const dateTime = LocalDateTime.now(ZoneId.UTC).format(this.dateFormat);
    const dateTimeBinary = Buffer.from(dateTime, "hex");
    const payload = Buffer.concat([this.statusResponseCommand, dateTimeBinary]);

    const response = {
      "dev_id": request.dev_id,
      "port": 2,
      "confirmed": false,
      "payload_raw": btoa(payload)
    };

    try {
      await this.http.post(request.downlink_url, response);
    }
    catch (e) {
      this.logger.warn(e);
    }

    return { data: [], links: {} };
  }
}

export interface JourneyPostRequest {
  payload_raw: string,
  dev_id: string,
  port: number,
  downlink_url: string
}
