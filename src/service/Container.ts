import { KoaService } from "./KoaService";
import { config } from "../../config/service";
import * as Koa from "koa";
import * as pino from "pino";

/**
 * Dependency container
 */
export class Container {

  public getKoaService(): KoaService {
    return new KoaService(
      config.port,
      new Koa(),
      pino({ prettyPrint: { translateTime: true } })
    );
  }

}
