import { HttpResponse } from "../../service/controller/HttpResponse";
import { JourneyJsonView } from "../Journey";
import { toHex } from "../TapReader";
import { Context } from "koa";
import { JourneyViewFactory } from "../JourneyViewFactory";
import { GenericRepository } from "../../database/GenericRepository";
import autobind from "autobind-decorator";
import { DateTimeFormatter, LocalDateTime, ZoneId } from "@js-joda/core";
import { AxiosInstance } from "axios";
import { Logger } from "pino";
import { DeviceStatus } from "../DeviceStatus";
import { TapProcessor } from "../TapProcessor";
import btoa = require("btoa");

/**
 * Endpoint for receiving LORaWAN data from The Things API
 */
@autobind
export class TapController {
  private readonly dateFormat = DateTimeFormatter.ofPattern("yyyyMMddHHmm");
  private readonly statusResponseCommand = Buffer.from("SETDT");

  constructor(
    private readonly tapProcessor: TapProcessor,
    private readonly viewFactory: JourneyViewFactory,
    private readonly statusRepository: GenericRepository<DeviceStatus>,
    private readonly http: AxiosInstance,
    private readonly logger: Logger
  ) {}

  /**
   * Read the raw payload and store the journeys.
   */
  public async post(request: JourneyPostRequest, ctx: Context): Promise<HttpResponse<JourneyJsonView[]>> {
    const buffer = Buffer.from(request.payload_raw, "base64");
    const rawData = Array.from(buffer).map(toHex).join(" ");
    this.logger.info("Tap: " + rawData);

    if (buffer[8] === 0x20) {
      await this.processStatus(request, rawData);

      return { data: [], links: {} };
    }
    else {
      const journeys = await this.tapProcessor.getJourneys(buffer, ctx);
      const view = await this.viewFactory.create();
      const links = {};
      const data = journeys.map(j => view.create(links, j));

      return { data, links };
    }
  }

  private async processStatus(request: JourneyPostRequest, rawData: string): Promise<void> {
    const dateTime = LocalDateTime.now(ZoneId.UTC).format(this.dateFormat);
    const dateTimeBinary = Buffer.from(dateTime, "hex");
    const payload = Buffer.concat([this.statusResponseCommand, dateTimeBinary]);

    const deviceStatus = {
      id: null,
      device_id: request.dev_id,
      status: rawData,
      received: LocalDateTime.now(ZoneId.UTC).toJSON()
    };

    const response = {
      "dev_id": request.dev_id,
      "port": 2,
      "confirmed": false,
      "payload_raw": btoa(payload)
    };

    try {
      await Promise.all([
        this.http.post(request.downlink_url, response),
        this.statusRepository.insertAll([deviceStatus])
      ]);
    }
    catch (e) {
      this.logger.warn(e);
    }
  }

}

export interface JourneyPostRequest {
  payload_raw: string,
  dev_id: string,
  port: number,
  downlink_url: string
}
