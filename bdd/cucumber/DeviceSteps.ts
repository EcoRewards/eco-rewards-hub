import { Then, When } from "cucumber";
import { World } from "./World";
import * as chai from "chai";
import btoa = require("btoa");

When("device {string} reports a status {string}", async function (deviceId: string, status: string) {
  const hex = status.split(" ").join("");
  const buffer = Buffer.from(hex, "hex");
  const payload = btoa(buffer);

  await World.api.post("/journey", { payload_raw: payload, dev_id: deviceId });
});

Then("the last status update from device {string} should be {string}", async function (device: string, status: string) {
  const response = await World.api.get("/devices");
  const deviceStatusExists = response.data.data.some(s => s.deviceId === device && s.status === status);

  chai.expect(deviceStatusExists).to.equal(true);
});