import * as chai from "chai";
import { Cryptography } from "./Cryptography";

describe("Cryptography", () => {
  const crypto = new Cryptography();

  it("generates a hash", async () => {
    const input = "a string";
    const hash = await crypto.hash(input);

    chai.expect(hash).to.not.equal(input);
  });

  it("applies salt so no two hashes are the same", async () => {
    const input = "a string";
    const hash1 = await crypto.hash(input);
    const hash2 = await crypto.hash(input);

    chai.expect(hash1).to.not.equal(hash2);
  });

  it("returns true if a password matches it's hash", async () => {
    const input = "a string";
    const hash = await crypto.hash(input);
    const result = await crypto.compare(input, hash);

    chai.expect(result).to.equal(true);
  });

  it("returns false if a password does not match it's hash", async () => {
    const input = "a string";
    const hash = await crypto.hash(input);
    const result = await crypto.compare("different password", hash);

    chai.expect(result).to.equal(false);
  });

});
