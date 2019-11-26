import * as chai from "chai";
import { fromGroupId, toGroupId } from "./Group";

describe("toGroupId", () => {

    it("extracts a numeric ID from the resource ID", () => {
        const actual = toGroupId("/group/1");

        chai.expect(actual).to.equal(1);
    });

});

describe("fromGroupId", () => {

    it("extracts creates a resource ID from the numeric ID", () => {
        const actual = fromGroupId(1);

        chai.expect(actual).to.equal("/group/1");
    });

});
