import { GenericPostController } from "./GenericPostController";
import * as chai from "chai";
import { Scheme } from "../../scheme/Scheme";

class MockOrganisationRepository {
  data: Scheme[] = [];

  public async save(scheme: Scheme) {
    scheme.id = 1;

    return scheme;
  }
}

class MockFactory {
  public create(item: object) {
    return item;
  }
}

class MockView {
  public create(links: object, item: object) {
    return item;
  }
}

class MockViewFactory {
  create() {
      return new MockView();
  }
}

describe("GenericPostController", () => {
  const controller = new GenericPostController(
    new MockOrganisationRepository() as any,
    new MockFactory() as any,
    new MockViewFactory() as any
  );

  it("should create a scheme", async () => {
    const result = await controller.post({ id: null, name: "scheme" }) as any;

    chai.expect(result.data.name).equal("scheme");
    chai.expect(result.data.id).equal(1);
  });
});
