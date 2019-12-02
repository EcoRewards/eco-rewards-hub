import * as chai from "chai";
import axios from "axios";
import { Given, Then, When } from "cucumber";
import { World } from "./World";
import { config } from "../../config/service";
import { toSchemeId } from "../../src";

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

Given(/^I create a scheme "([^"]*)"$/, async function(name: string) {
  const response = await World.api.post("scheme", { name: name });

  this.schemes[name] = response.data.data;
});

Then("I should see {string} in the list of schemes {string} times", async function (scheme: string, count: string) {
  const schemes = await World.api.get("schemes");
  const actual = schemes.data.data.filter(s => s.name === scheme);

  chai.expect(actual.length).to.equal(+count);
  const response = await World.api.get("scheme/" + toSchemeId(actual[0].id));

  chai.expect(response.data.data.name).to.equal(scheme);
});

When("I create an organisation {string} in scheme {string}", async function (organisation: string, scheme: string) {
  const schemeId = this.schemes[scheme].id;

  await World.api.post("organisation", { name: organisation, scheme: schemeId });
});

Then("I should see {string} in the list of organisations {string} times", async function (name: string, count: string) {
  const schemes = await World.api.get("organisations");
  const actual = schemes.data.data.filter(s => s.name === name).length;

  chai.expect(actual).to.equal(+count);
});
