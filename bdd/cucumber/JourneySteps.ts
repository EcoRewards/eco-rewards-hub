import { Then, When } from "cucumber";
import { World } from "./World";
import * as chai from "chai";
import FormData = require("form-data");
import btoa = require("btoa");
import { JourneyJsonView } from "../../src";

When("I upload a file", async function ({ rawTable }: any) {
  const members = this.createdMembers;
  const csv = rawTable
    .slice(1)
    .map(row => {
      row[0] = row[0].length >= 16 ? row[0] : members[row[0]].id.substring(7);

      return row.join();
    })
    .join("\n");

  const formData = new FormData();
  formData.append("file", csv, { filename: "file" });

  const response = await World.api.post(
    "/journeys",
    formData,
    { headers: formData.getHeaders() }
  );

  chai.expect(response.data.data.errors).to.deep.equal([]);
});

Then("I should see the following journeys", async function ({ rawTable }: any) {
  const { data } = await World.api.get("/journeys");
  const journeys = data.data as JourneyJsonView[];

  for (let i = 1; i < rawTable.length; i ++) {
    const memberIndex = rawTable[i][0];
    const member = memberIndex.length >= 16 ? this.createdMember : this.createdMembers[memberIndex];
    const journey = journeys.find(j => j.memberId === member.id && j.travelDate === rawTable[i][2]);

    chai.expect(journey).to.not.equal(undefined);
    chai.expect(journey!.source).to.equal(rawTable[i][1]);
    chai.expect(journey!.travelDate).to.equal(rawTable[i][2]);
    chai.expect(journey!.mode).to.equal(rawTable[i][3]);
    chai.expect(journey!.distance).to.equal(+rawTable[i][4]);
  }
});

Then("I wait until the rewards have been processed", async function() {
  await new Promise(r => setTimeout(r, 2000));
});

Then("these members should have the following rewards", async function ({ rawTable }: any) {
  for (const row of rawTable.slice(1)) {
    const memberIndex = row[0];
    const member = memberIndex.length >= 16 ? this.createdMember : this.createdMembers[memberIndex];
    const {data} = await World.api.get(member.id);

    chai.expect(data.data.rewards).to.equal(+row[1]);
    chai.expect(data.data.carbonSaving).to.equal(+row[2]);
  }
});

When("I tap with a smartcard {string}", async function (member: string) {
  const device = "AAAAAAAA";
  const tsn = "AAAAAAAA";
  const tx1minsSinceEpoch = "000001";
  const hex = device + tsn + member + tx1minsSinceEpoch;
  const buffer = Buffer.from(hex, "hex");
  const payload = btoa(buffer);
  const response = await World.api.post("/journey", { payload_raw: payload });

  chai.expect(response.data.data[0].mode).to.deep.equal("bus");
});
