import * as chai from "chai";
import axios from "axios";
import { Given, Then, When } from "cucumber";
import { World } from "./World";
import { config } from "../../config/service";

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

  if (+count > 0) {
    const response = await World.api.get(actual[0].id);

    chai.expect(response.data.data.name).to.equal(scheme);
  }
});

When("I create an organisation {string} in scheme {string}", async function (organisation: string, scheme: string) {
  const schemeId = this.schemes[scheme].id;
  const response = await World.api.post("organisation", { name: organisation, scheme: schemeId });

  this.organisations[organisation] = response.data.data;
});

Then("I should see {string} in the list of organisations {string} times", async function (name: string, count: string) {
  const schemes = await World.api.get("organisations");
  const actual = schemes.data.data.filter(s => s.name === name).length;

  chai.expect(actual).to.equal(+count);
});

When("I create a group {string} in the organisation {string}", async function (group: string, organisation: string) {
  const organisationId = this.organisations[organisation].id;
  const response = await World.api.post("group", { name: group, organisation: organisationId });

  this.groups[group] = response.data.data;
});

Then("I should see {string} in the list of groups {string} times", async function (name: string, count: string) {
  const groups = await World.api.get("groups");
  const actual = groups.data.data.filter(s => s.name === name).length;

  chai.expect(actual).to.equal(+count);
});

When('I rename a scheme from {string} to {string}', async function (from: string, to: string) {
  const scheme = this.schemes[from];
  const updatedScheme = { ...scheme, name: to };
  const response = await World.api.put(scheme.id, updatedScheme);

  chai.expect(response.data.data.name).to.equal(to);

  this.schemes[to] = updatedScheme;
});

When('I delete the scheme {string}', async function (name: string) {
  const scheme = this.schemes[name];
  const response = await World.api.delete(scheme.id);

  chai.expect(response.data.data).to.equal("success");
});

When('I rename an organisation from {string} to {string}', async function (from: string, to: string) {
  const organisation = this.organisations[from];
  const updatedOrganisation = { ...organisation, name: to };
  const response = await World.api.put(organisation.id, updatedOrganisation);

  chai.expect(response.data.data.name).to.equal(to);

  this.organisations[to] = updatedOrganisation;
});

When('I delete the organisation {string}', async function (name: string) {
  const scheme = this.organisations[name];
  const response = await World.api.delete(scheme.id);

  chai.expect(response.data.data).to.equal("success");
});

When('I rename a group from {string} to {string}', async function (from: string, to: string) {
  const group = this.groups[from];
  const updatedGroup = { ...group, name: to };
  const response = await World.api.put(group.id, updatedGroup);

  chai.expect(response.data.data.name).to.equal(to);

  this.groups[to] = updatedGroup;
});

When('I delete the group {string}', async function (name: string) {
  const scheme = this.groups[name];
  const response = await World.api.delete(scheme.id);

  chai.expect(response.data.data).to.equal("success");
});
