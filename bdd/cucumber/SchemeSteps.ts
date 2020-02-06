import { Given, Then, When } from "cucumber";
import { World } from "./World";
import * as chai from "chai";

Given(/^I create a scheme "([^"]*)"$/, async function(name: string) {
  const response = await World.api.post("scheme", { name: name, vacClientId: 155 });

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

When("I rename a scheme from {string} to {string}", async function (from: string, to: string) {
  const scheme = this.schemes[from];
  const updatedScheme = { ...scheme, name: to };
  const response = await World.api.put(scheme.id, updatedScheme);

  chai.expect(response.data.data.name).to.equal(to);

  this.schemes[to] = updatedScheme;
});

When("I delete the scheme {string}", async function (name: string) {
  const scheme = this.schemes[name];
  const response = await World.api.delete(scheme.id);

  chai.expect(response.data.data).to.equal("success");
});
