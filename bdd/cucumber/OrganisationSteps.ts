import { Then, When } from "cucumber";
import { World } from "./World";
import * as chai from "chai";

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

When("I rename an organisation from {string} to {string}", async function (from: string, to: string) {
  const organisation = this.organisations[from];
  const updatedOrganisation = { ...organisation, name: to };
  const response = await World.api.put(organisation.id, updatedOrganisation);

  chai.expect(response.data.data.name).to.equal(to);

  this.organisations[to] = updatedOrganisation;
});

When("I delete the organisation {string}", async function (name: string) {
  const scheme = this.organisations[name];
  const response = await World.api.delete(scheme.id);

  chai.expect(response.data.data).to.equal("success");
});
