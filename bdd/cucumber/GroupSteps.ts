import { Then, When } from "cucumber";
import { World } from "./World";
import * as chai from "chai";

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

When("I rename a group from {string} to {string}", async function (from: string, to: string) {
  const group = this.groups[from];
  const updatedGroup = { ...group, name: to };
  const response = await World.api.put(group.id, updatedGroup);

  chai.expect(response.data.data.name).to.equal(to);

  this.groups[to] = updatedGroup;
});

When("I delete the group {string}", async function (name: string) {
  const scheme = this.groups[name];
  const response = await World.api.delete(scheme.id);

  chai.expect(response.data.data).to.equal("success");
});
