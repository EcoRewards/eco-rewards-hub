import { setWorldConstructor } from "cucumber";
import { config } from "../../config/service";

class World {
  private host = process.env.TEST_URL || `http://localhost:${config.port}/`;
  private token?: string;
}

setWorldConstructor(World);
