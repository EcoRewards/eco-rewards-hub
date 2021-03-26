import { HttpResponse } from "../../service/controller/HttpResponse";
import { Journey, JourneyJsonView } from "../Journey";
import { TapReader, toHex } from "../TapReader";
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
    private readonly tapReader: TapReader,
    private readonly tapProcessor: TapProcessor,
    private readonly viewFactory: JourneyViewFactory,
    private readonly statusRepository: GenericRepository<DeviceStatus>,
    private readonly http: AxiosInstance,
    private readonly logger: Logger
  ) {}

  /**
   * Read the raw payload and store the journeys.
   */
  public async post(req: JourneyPostRequest | JourneyPostV2, ctx: Context): Promise<HttpResponse<JourneyJsonView[]>> {
    const formattedRequest = this.formatRequest(req);
    const buffer = Buffer.from(formattedRequest.payload_raw, "base64");
    const rawData = Array.from(buffer).map(toHex).join(" ");
    const links = {};
    let data: JourneyJsonView[] = [];

    this.logger.info("Tap: " + rawData);

    if (buffer[8] === 0x20) {
      const header = ctx.header["x-downlink-apikey"] && { Authorization: "Bearer " + ctx.header["x-downlink-apikey"] };

      await this.processStatus(formattedRequest, rawData, header);
    } else {
      const deviceId = Array.from(buffer).slice(0, 4).map(toHex).join("");
      const taps = this.tapReader.getTaps(buffer);
      const journeys = await this.tapProcessor.getJourneys(taps, deviceId, ctx.adminUserId);
      const view = await this.viewFactory.create();

      data = journeys.map(j => view.create(links, j));
    }

    return { data, links };
  }

  private formatRequest(request: any): JourneyPostRequest {
    return request.payload_raw ? request : {
      payload_raw: request.uplink_message.frm_payload,
      dev_id: request.end_device_ids.device_id,
      port: -1,
      downlink_url: `https://smartberks.eu1.cloud.thethings.industries/api/v3/as/applications/ecorewards/webhooks/test/devices/${request.end_device_ids.device_id}/down/push`,
    };
  }

  private async processStatus(request: JourneyPostRequest, rawData: string, headers?: Headers): Promise<void> {
    const dateTime = LocalDateTime.now(ZoneId.UTC).format(this.dateFormat);
    const dateTimeBinary = Buffer.from(dateTime, "hex");
    const payload = Buffer.concat([this.statusResponseCommand, dateTimeBinary]);

    const deviceStatus = {
      id: null,
      device_id: request.dev_id,
      status: rawData,
      received: LocalDateTime.now(ZoneId.UTC).toJSON()
    };

    const response = request.port !== -1 ? {
      "dev_id": request.dev_id,
      "port": 2,
      "confirmed": false,
      "payload_raw": btoa(payload)
    } : {
      "downlinks": [
        {
          "frm_payload": btoa(payload),
          "f_port": 2,
          "priority": "NORMAL"
        }
      ]
    };

    try {
      await Promise.all([
        this.http.post(request.downlink_url, response,  { headers }),
        this.statusRepository.insertAll([deviceStatus])
      ]);
    } catch (e) {
      this.logger.warn(e);
    }
  }

}

export interface JourneyPostRequest {
  payload_raw: string,
  dev_id: string,
  port: number,
  downlink_url: string,
}

interface JourneyPostV2 {
  end_device_ids: {
    device_id: string,
    application_ids: {
      application_id: string
    }
  },
  uplink_message: {
    frm_payload: string,
  },
}

type Headers = Record<string, string>;
