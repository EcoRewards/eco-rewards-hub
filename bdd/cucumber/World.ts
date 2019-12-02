import { setWorldConstructor } from "cucumber";
import { AxiosInstance } from "axios";
import { SchemeJsonView } from "../../src/scheme/Scheme";

/**
 * World state for test execution
 */
export class World {
  static api: AxiosInstance;

  schemes: Record<string, SchemeJsonView> = {};
  organisations: Record<string, SchemeJsonView> = {};
}

setWorldConstructor(World);
