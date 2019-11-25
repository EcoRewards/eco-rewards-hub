import axios from "axios";
import {Given, Then} from "cucumber";
import { World } from "./World";

Given("I am logged in as an administrator", async function() {
  if (World.token) {
    return;
  }

  const result = await axios.post(this.host + "login", { username: "test@test.com", password: "password" });
  World.token = result.data.token;
});

Given(/^I create a scheme "([^"]*)"$/, async function(name: string) {
  if (World.token) {
    return;
  }

  const result = await axios.post(this.host + "scheme", { name: name });
  World.scheme = result.data;
});
