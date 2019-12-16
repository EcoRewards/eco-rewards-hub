import { Then, When } from "cucumber";
import { World } from "./World";
import * as chai from "chai";
import FormData = require("form-data");

When("I upload a file", async function ({ rawTable }: any) {
  const members = this.createdMembers;
  const csv = rawTable
    .slice(1)
    .map(row => [members[row[0]].id.substring(7), ...row.slice(1)].join())
    .join("\n");

  const formData = new FormData();
  formData.append("file", csv, { filename: "file" });

  const response = await World.api.post(
    "/journey",
    formData,
    { headers: formData.getHeaders() }
  );

  chai.expect(response.data.data.errors).to.deep.equal([]);
});

Then("I should see the following journeys", async function ({ rawTable }: any) {
  const { data } = await World.api.get("/journeys");
  const journeys = data.data.reverse();

  for (let i = 1; i < rawTable.length; i ++) {
    const memberIndex = rawTable[i][0];
    const memberId = this.createdMembers[memberIndex].id;

    chai.expect(journeys[i - 1].memberId).to.equal(memberId);
    chai.expect(journeys[i - 1].source).to.equal(rawTable[i][1]);
    chai.expect(journeys[i - 1].travelDate).to.equal(rawTable[i][2]);
    chai.expect(journeys[i - 1].mode).to.equal(rawTable[i][3]);
    chai.expect(journeys[i - 1].distance).to.equal(+rawTable[i][4]);
  }
});

Then("I wait until the rewards have been processed", async function() {
  await new Promise(r => setTimeout(r, 2000));
});

Then("these members should have the following rewards", async function ({ rawTable }: any) {
  for (const row of rawTable.slice(1)) {
    const memberIndex = row[0];
    const memberId = this.createdMembers[memberIndex].id;
    const {data} = await World.api.get(memberId);

    chai.expect(data.data.rewards).to.equal(+row[1]);
    chai.expect(data.data.carbonSaving).to.equal(+row[2]);
  }
});
