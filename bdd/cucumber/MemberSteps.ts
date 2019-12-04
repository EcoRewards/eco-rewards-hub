import * as chai from "chai";
import { Given, Then, When } from "cucumber";
import { World } from "./World";
import { indexBy } from "ts-array-utils";
import { MemberJsonView } from "../../src/member/Member";

async function memberCheck(quantity: string, group: string) {
  const allMembers = await World.api.get("/members");
  const groupMembers = allMembers.data.data.filter(m => m.group === group);

  chai.expect(groupMembers.length).to.equal(+quantity);
}

Given("there are {string} members in the group {string}", memberCheck);

When("I create {string} members in the group {string}", async function (quantity: string, group: string) {
  const request = {
    quantity: +quantity,
    group: this.groups[group].id,
    defaultTransportMode: "bus",
    defaultDistance: 4.2
  };

  const response = await World.api.post("/members", request);
  this.createdMembers = response.data.data;
});

Then("I should get {string} unique IDs back", function (quantity: string) {
  const indexedMembers = this.createdMembers.reduce(indexBy<MemberJsonView>(m => m.id), {});

  chai.expect(Object.keys(indexedMembers).length).to.equal(+quantity);
});

Then("the group {string} should contain {string} members", async function (group: string, quantity: string) {
  memberCheck(quantity, group);
});