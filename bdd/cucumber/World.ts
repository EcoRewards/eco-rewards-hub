import { setWorldConstructor } from "cucumber";
import { config } from "../../config/service";

/**
 * World state for test execution
 */
export class World {
  static token?: string;
  static scheme: Scheme;

  readonly host = process.env.TEST_URL || `http://localhost:${config.port}/`;
}

interface Scheme {
  id: number | null,
  name: string
}

setWorldConstructor(World);
