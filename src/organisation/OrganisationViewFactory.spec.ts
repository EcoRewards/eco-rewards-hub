import * as chai from "chai";
import { OrganisationView } from "./OrganisationView";
import { OrganisationViewFactory } from "./OrganisationViewFactory";

class MockRepository {
  called = false;
  constructor(
    private readonly results: object
  ) { }

  public async getIndexedById() {
    this.called = true;

    return this.results;
  }
}

describe("OrganisationViewFactory", () => {
  const repository = new MockRepository({
    1: { id: 1, name: "scheme" },
    2: { id: 2, name: "scheme2" }
  }) as any;

  const view = new OrganisationViewFactory(repository);

  it("creates a view", async () => {
    await view.create();

    chai.expect(repository.called).to.equal(true);
  });

});
