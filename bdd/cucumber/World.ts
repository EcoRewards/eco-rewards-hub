import { setWorldConstructor } from "cucumber";
import { config } from "../../config/service";

/**
 * World state for test execution
 */
export class World {
  static token?: string;

  readonly host = process.env.TEST_URL || `http://localhost:${config.port}/`;
}

setWorldConstructor(World);
