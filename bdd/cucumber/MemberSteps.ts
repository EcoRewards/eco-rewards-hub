import * as chai from "chai";
import { Given, Then, When } from "cucumber";
import { World } from "./World";
import { indexBy } from "ts-array-utils";
import { MemberJsonView } from "../../src/member/Member";
import { GroupJsonView } from "../../src";

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

Then("I should see a member {string}", async function (memberId: string) {
  await World.api.get("/member/" + memberId);
});

When("I create an account with smartcard {string}", async function (smartcard: string) {
  const defaultTransportMode = "bus";
  const defaultDistance = 1.5;
  const groups = Object.values(this.groups) as GroupJsonView[];
  const group = groups[0].id;

  const response = await World.api.post("/member", { smartcard, defaultTransportMode, defaultDistance, group });
  this.createdMember = response.data.data;
});

When("I export the members as CSV", async function () {
  const response = await World.api.get("/members", { headers: { Accept: "text/csv" } });
  this.memberCsv = response.data;
});

Then("the CSV should have at least {string} members", async function (quantity: string) {
  chai.expect(this.memberCsv.split("\n").length + 1).to.be.greaterThan(+quantity);
});

When("I change my distance {string} and I change my default transport {string}",
  async function (defaultDistance: string, defaultTransportMode: string) {
  const id = this.createdMember.id;
  const response = await World.api.put(id, {
    defaultDistance,
    defaultTransportMode,
    previousTransportMode: "bus",
    group: this.createdMember.group
  });
  this.createdMember = response.data.data;
});

Then(
  "I should see a default distance {string}, default transport mode {string} and previous transport mode {string}",
  async function (distance: string, transport: string, previousMode: string) {
    const id = this.createdMember.id;
    const response = await World.api.get(id);

    chai.expect(response.data.data.defaultDistance).to.be.equal(+distance);
    chai.expect(response.data.data.defaultTransportMode).to.be.equal(transport);
    chai.expect(response.data.data.previousTransportMode).to.be.equal(previousMode);
});

When("I change the members group to {string}", async function (groupName: string) {
  const group = this.groups[groupName].id;
  const startId = this.createdMembers[0].id;
  const endId = this.createdMembers[this.createdMembers.length - 1].id;

  await World.api.patch("/members", { startId, endId, group });
});
