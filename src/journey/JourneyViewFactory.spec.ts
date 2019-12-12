import * as chai from "chai";
import { JourneyViewFactory } from "./JourneyViewFactory";

class MockRepository {
  called = false;

  public async getIndexedById() {
    this.called = true;
  }
}

describe("JourneyViewFactory", () => {
  const repository = new MockRepository() as any;
  const view = new JourneyViewFactory(repository);

  it("creates a view", async () => {
    await view.create();

    chai.expect(repository.called).to.equal(true);
  });

});
