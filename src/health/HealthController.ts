import autobind from "autobind-decorator";

/**
 * Controller that returns the health of the service
 */
@autobind
export class HealthController {

  /**
   * Always return "UP".
   */
  public get(): HealthControllerResponse {
    return {
      status: "UP"
    };
  }

}

export interface HealthControllerResponse {
  status: "UP" | "DOWN"
}
