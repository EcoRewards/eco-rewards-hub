import { WriteController } from "./WriteController";
import * as chai from "chai";
import { Scheme } from "../../scheme/Scheme";

class MockOrganisationRepository {
  data: Scheme[] = [];

  public async save(scheme: Scheme) {
    scheme.id = 1;

    return scheme;
  }

  public async deleteOne() {

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

describe("WriteController", () => {
  const controller = new WriteController(
    new MockOrganisationRepository() as any,
    new MockFactory() as any,
    new MockViewFactory() as any
  );

  it("should create a scheme", async () => {
    const result = await controller.post({ id: null, name: "scheme" }) as any;

    chai.expect(result.data.name).equal("scheme");
    chai.expect(result.data.id).equal(1);
  });

  it("should create a scheme", async () => {
    const result = await controller.put({ id: 1, name: "newScheme" }) as any;

    chai.expect(result.data.name).equal("newScheme");
    chai.expect(result.code).equal(undefined); // defaults to 200
  });

  it("should delete scheme", async () => {
    const result = await controller.delete({ id: "1" });

    chai.expect(result.data).equal("success");
  });
});
