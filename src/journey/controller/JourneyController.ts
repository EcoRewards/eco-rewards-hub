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

/**
 * Endpoint for receiving LORaWAN data from The Things API
 */
@autobind
export class JourneyController {

  constructor(
    private readonly tapReader: TapReader,
    private readonly viewFactory: JourneyViewFactory,
    private readonly journeyRepository: GenericRepository<Journey>,
    private readonly memberRepository: GenericRepository<Member>
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
  public async post(request: JourneyPostRequest, ctx: Context): Promise<HttpResponse<JourneyJsonView[]>> {
    const taps = this.tapReader.getTaps(request.payload_raw);
    const factory = await this.getFactory();
    const journeys = Object.entries(taps).map(t => factory.create(t, ctx.adminUserId));
    const savedJourneys = await this.journeyRepository.insertAll(journeys);
    const view = await this.viewFactory.create();
    const links = {};
    const data = savedJourneys.map(j => view.create(links, j));

    return { data, links };
  }

}

export interface JourneyPostRequest {
  payload_raw: string
}
