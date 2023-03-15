import * as chai from "chai";
import { MemberViewFactory } from "./MemberViewFactory";

class MockRepository {
  called = false;

  public async getIndexedById() {
    this.called = true;
  }
  public async selectIn() {
    this.called = true;

    return [];
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
  const repository2 = new MockRepository() as any;
  const viewFactory = new MockViewFactory() as any;
  const viewFactory2 = new MockViewFactory() as any;
  const view = new MemberViewFactory(repository, repository2, viewFactory, viewFactory2);

  it("creates a view", async () => {
    await view.create([]);

    chai.expect(repository.called).to.equal(true);
    chai.expect(viewFactory.called).to.equal(true);
    chai.expect(repository2.called).to.equal(true);
    chai.expect(viewFactory2.called).to.equal(true);
  });

});
