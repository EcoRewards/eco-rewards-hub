import * as chai from "chai";
import { JourneyViewFactory } from "./JourneyViewFactory";

class MockRepository {
  called = false;

  public async getIndexedById() {
    this.called = true;
  }
}

describe("JourneyViewFactory", () => {
  const repository1 = new MockRepository() as any;
  const repository2 = new MockRepository() as any;
  const view = new JourneyViewFactory(repository1, repository2);

  it("creates a view", async () => {
    await view.create();

    chai.expect(repository1.called).to.equal(true);
    chai.expect(repository2.called).to.equal(true);
  });

});
