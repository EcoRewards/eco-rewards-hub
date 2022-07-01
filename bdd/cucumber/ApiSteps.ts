import axios from "axios";
import { World } from "./World";
import { config } from "../../config/service";
import { Given } from "@cucumber/cucumber";

Given("I am logged in as an administrator", async function() {
  if (World.api as any) {
    return;
  }

  const host = process.env.TEST_URL || `http://localhost:${config.port}/`;
  const result = await axios.post(host + "login", { username: "test@test.com", password: "password" });

  World.api = axios.create({
    baseURL: host,
    headers: { authorization: "Basic " + result.data.data.token },
  });
});
