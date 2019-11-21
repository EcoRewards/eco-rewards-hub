import * as chai from "chai";
import { OrganisationsController } from "./OrganisationsController";

class MockOrganisationRepository {
  public async selectAll(table: string) {
    return [
      { id: 1, name: "admin", scheme_id: 1 },
      { id: 2, name: "Org 1", scheme_id: 2 },
      { id: 3, name: "Org 2", scheme_id: 3 },
    ];
  }
}

class MockSchemeRepository {
  public async getSchemeIndex() {
    return {
      1: { id: 1, name: "admin" },
      2: { id: 2, name: "Scheme 1" },
      3: { id: 3, name: "Scheme 2" }
    };
  }
}

describe("OrganisationsController", () => {
  const controller = new OrganisationsController(
    new MockOrganisationRepository() as any,
    new MockSchemeRepository() as any
  );

  it("returns organisations", async () => {
    const result = await controller.get();
    const expected = [
      { id: 1, name: "admin", scheme: "/scheme/1" },
      { id: 2, name: "Org 1", scheme: "/scheme/2" },
      { id: 3, name: "Org 2", scheme: "/scheme/3" },
    ];

    chai.expect(result.data).to.deep.equal(expected);
  });

  it("links schemes", async () => {
    const result = await controller.get();
    const expected = {
      "/scheme/1": { id: 1, name: "admin" },
      "/scheme/2": { id: 2, name: "Scheme 1" },
      "/scheme/3": { id: 3, name: "Scheme 2" }
    };

    chai.expect(result.links).to.deep.equal(expected);
  });

});
