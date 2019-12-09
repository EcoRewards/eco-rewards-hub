import { Readable } from "stream";
import { HttpResponse } from "../../service/controller/HttpResponse";

/**
 * Journey endpoints
 */
export class JourneyController {

  /**
   * Handler for the POST /journey endpoint. Processes the input stream as a CSV of member
   * journeys and returns any errors generated during processing.
   */
  public post(input: Readable): Promise<HttpResponse<JourneyPostResponse>> {

  }
}

export interface JourneyPostResponse {
  errors: string[]
}
