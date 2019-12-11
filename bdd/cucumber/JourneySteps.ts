import { When } from "cucumber";
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
