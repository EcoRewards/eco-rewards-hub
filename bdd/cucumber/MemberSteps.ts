import * as chai from "chai";
import { Given, Then, When } from "cucumber";
import { World } from "./World";
import { indexBy } from "ts-array-utils";
import { MemberJsonView } from "../../src/member/Member";

Given("there are {string} members in the group {string}", async function(quantity: string, group: string) {
    const allMembers = await World.api.get("/members");
    const groupId = this.groups[group].id;
    const groupMembers = allMembers.data.data.filter(m => m.group === groupId);

    chai.expect(groupMembers.length).to.equal(+quantity);
  }
);

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

Then("the group {string} should contain {string} members", async function(group: string, quantity: string) {
    const allMembers = await World.api.get("/members");
    const groupId = this.groups[group].id;
    const groupMembers = allMembers.data.data.filter(m => m.group === groupId);

    chai.expect(groupMembers.length).to.equal(+quantity);
  }
);

When("I view member a member in the group {string}", async function (group: string) {
  const member = await World.api.get(this.createdMembers[0].id);

  this.member = member.data.data;
});

Then("they should have {string} rewards", function (quantity: string) {
  chai.expect(this.member.rewards).to.equal(+quantity);
});

Then("a carbon saving of {string}", function (carbonSaving: string) {
  chai.expect(this.member.carbonSaving).to.equal(+carbonSaving);
});
