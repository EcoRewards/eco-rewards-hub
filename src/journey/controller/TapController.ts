import { HttpResponse } from "../../service/controller/HttpResponse";
import { Journey, JourneyJsonView } from "../Journey";
import { TapReader, toHex } from "../TapReader";
import { JourneyFactory } from "../JourneyFactory";
import { Context } from "koa";
import { JourneyViewFactory } from "../JourneyViewFactory";
import { GenericRepository } from "../../database/GenericRepository";
import { Member } from "../../member/Member";
import { indexBy } from "ts-array-utils";
import autobind from "autobind-decorator";
import { DateTimeFormatter, LocalDateTime, ZoneId } from "@js-joda/core";
import { AxiosInstance } from "axios";
import { Logger } from "pino";
import btoa = require("btoa");
import { DeviceStatus } from "../DeviceStatus";
import { MemberModelFactory } from "../../member/MemberModelFactory";

/**
 * Endpoint for receiving LORaWAN data from The Things API
 */
@autobind
export class TapController {
  private readonly dateFormat = DateTimeFormatter.ofPattern("yyyyMMddHHmm");
  private readonly statusResponseCommand = Buffer.from("SETDT");

  constructor(
    private readonly tapReader: TapReader,
    private readonly viewFactory: JourneyViewFactory,
    private readonly journeyRepository: GenericRepository<Journey>,
    private readonly memberRepository: GenericRepository<Member>,
    private readonly statusRepository: GenericRepository<DeviceStatus>,
    private readonly http: AxiosInstance,
    private readonly logger: Logger
  ) {}

  /**
   * Read the raw payload and store the journeys.
   */
  public post(request: JourneyPostRequest, ctx: Context): Promise<HttpResponse<JourneyJsonView[]>> {
    const buffer = Buffer.from(request.payload_raw, "base64");
    const rawData = Array.from(buffer).map(toHex).join(" ");
    this.logger.info("Tap: " + rawData);

    if (buffer[8] === 0x20) {
      return this.processStatus(request, rawData);
    }
    else {
      return this.processTaps(buffer, ctx);
    }
  }

  private async processTaps(buffer: Buffer, ctx: Context): Promise<HttpResponse<JourneyJsonView[]>> {
    const deviceId = Array.from(buffer).slice(0, 4).map(toHex).join("");
    const taps = Object.entries(this.tapReader.getTaps(buffer));
    const journeyFactory = await this.getJourneyFactory();
    const journeys = await Promise.all(taps.map(t => journeyFactory.create(t, ctx.adminUserId, deviceId)));
    const savedJourneys = await this.journeyRepository.insertAll(journeys);
    const view = await this.viewFactory.create();
    const links = {};
    const data = savedJourneys.map(j => view.create(links, j));

    return { data, links };
  }

  private async getJourneyFactory(): Promise<JourneyFactory> {
    const members = await this.memberRepository.getIndexedById();
    const membersBySmartcard = Object.values(members).reduce(indexBy(m => m.smartcard || ""), {});

    return new JourneyFactory(members, membersBySmartcard, this.memberRepository, new MemberModelFactory());
  }

  private async processStatus(request: JourneyPostRequest, rawData: string): Promise<HttpResponse<JourneyJsonView[]>> {
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

    return { data: [], links: {} };
  }
}

export interface JourneyPostRequest {
  payload_raw: string,
  dev_id: string,
  port: number,
  downlink_url: string
}
