import { Then, When } from "cucumber";
import { World } from "./World";
import * as chai from "chai";
import * as fs from "fs";
import { writeFileSync } from "fs";
import FormData = require("form-data");

When("I upload a file", async function ({ rawTable }: any) {
  const csv = rawTable
    .slice(1)
    .map(row => row.join())
    .join("\n");

  const formData = new FormData();
  formData.append("file", csv);

  const response = await World.api.post(
    "/journey",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );

  chai.expect(response.data.data.errors).to.deep.equal([]);
});

