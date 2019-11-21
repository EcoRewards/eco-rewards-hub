import axios from "axios";
import { Given } from "cucumber";

Given("I am logged in as an administrator", async function() {
  if (this.token) {
    return;
  }

  const result = await axios.post(this.host + "/login", {username: "test@test.com", password: "test"});

  this.token = result.data.token;
});