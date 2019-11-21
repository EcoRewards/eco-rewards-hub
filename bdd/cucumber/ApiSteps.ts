import axios from "axios";
import { Given } from "cucumber";
import { World } from "./World";

Given("I am logged in as an administrator", async function() {
  if (World.token) {
    return;
  }

  const result = await axios.post(this.host + "login", { username: "test@test.com", password: "password" });
  World.token = result.data.token;
});