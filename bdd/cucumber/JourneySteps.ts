import { Then, When } from "cucumber";
import { World } from "./World";
import * as chai from "chai";
import FormData = require("form-data");

When("I upload a file", async function ({ rawTable }: any) {
  const members = this.createdMembers;
  const csv = rawTable
    .slice(1)
    .map((row, i) => [members[i].id.substring(7), ...row.slice(1)].join())
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
    chai.expect(journeys[i - 1].source).to.equal(rawTable[i][0]);
    chai.expect(journeys[i - 1].travelDate).to.equal(rawTable[i][1]);
    chai.expect(journeys[i - 1].mode).to.equal(rawTable[i][2]);
    chai.expect(journeys[i - 1].distance).to.equal(+rawTable[i][3]);
  }

});
