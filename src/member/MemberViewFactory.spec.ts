import * as chai from "chai";
import { MemberViewFactory } from "./MemberViewFactory";

class MockRepository {
  called = false;

  public async getIndexedById() {
    this.called = true;
  }
}

class MockViewFactory {
  called = false;

  public async create() {
    this.called = true;
  }
}

describe("MemberViewFactory", () => {
  const repository = new MockRepository() as any;
  const viewFactory = new MockViewFactory() as any;
  const view = new MemberViewFactory(repository, viewFactory);

  it("creates a view", async () => {
    await view.create();

    chai.expect(repository.called).to.equal(true);
    chai.expect(viewFactory.called).to.equal(true);
  });

});
