import { setWorldConstructor } from "cucumber";
import { AxiosInstance } from "axios";
import { SchemeJsonView } from "../../src/scheme/Scheme";
import { GroupJsonView } from "../../src/group/Group";

/**
 * World state for test execution
 */
export class World {
  static api: AxiosInstance;

  schemes: Record<string, SchemeJsonView> = {};
  organisations: Record<string, SchemeJsonView> = {};
  groups: Record<string, GroupJsonView> = {};
}

setWorldConstructor(World);
