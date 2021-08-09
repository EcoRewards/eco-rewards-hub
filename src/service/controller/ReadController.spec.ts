import * as chai from "chai";
import { ReadController, ViewFactory } from "./ReadController";
import { Filter, GenericRepository } from "../../database/GenericRepository";
import { Organisation, OrganisationJsonView } from "../../organisation/Organisation";

class MockRepository {

  public async selectOne(id: number) {
    return {
      1: { id: 1, name: "admin", scheme_id: 1 },
      2: { id: 2, name: "Org 1", scheme_id: 2 },
      3: { id: 3, name: "Org 2", scheme_id: 3 },
    }[id];
  }

  public async selectAll(table: string) {
    return [
      { id: 1, name: "admin", scheme_id: 1 },
      { id: 2, name: "Org 1", scheme_id: 2 },
      { id: 3, name: "Org 2", scheme_id: 3 },
    ];
  }

  public async selectPaginated(page: number, perPage: number, filters: Filter[]) {
    const rows = [
      { id: 1, name: "admin", scheme_id: 1 },
      { id: 2, name: "Org 1", scheme_id: 2 },
      { id: 3, name: "Org 2", scheme_id: 3 },
    ];

    const pagination = { count: 5 };

    return { rows, pagination };
  }
}

class MockViewFactoryFactory {
  public async create() {
    return new MockViewFactory();
  }
}

class MockViewFactory<Model, View> {
  i = 0;
  records: any[] = [
    { id: 1, name: "admin", scheme: "/scheme/1" },
    { id: 2, name: "Org 1", scheme: "/scheme/2" },
    { id: 3, name: "Org 2", scheme: "/scheme/3" },
  ];

  public create(links: object, record: Model): View {
    return this.records[this.i++];
  }
}

describe("ReadController", () => {
  const controller = new ReadController(
    new MockRepository() as GenericRepository<Organisation>,
    new MockViewFactoryFactory() as ViewFactory<Organisation, OrganisationJsonView>
  );

  it("returns all results", async () => {
    const result = await controller.getAll({});
    const expected = [
      { id: 1, name: "admin", scheme: "/scheme/1" },
      { id: 2, name: "Org 1", scheme: "/scheme/2" },
      { id: 3, name: "Org 2", scheme: "/scheme/3" },
    ];

    chai.expect(result.data).to.deep.equal(expected);
  });

  it("returns paginated results", async () => {
    const result = await controller.getAll({ page: "1", quantity: "2" });
    const expected = [
      { id: 1, name: "admin", scheme: "/scheme/1" },
      { id: 2, name: "Org 1", scheme: "/scheme/2" },
      { id: 3, name: "Org 2", scheme: "/scheme/3" },
    ];

    chai.expect(result.data).to.deep.equal(expected);
    chai.expect(result.pagination?.count).to.deep.equal(5);
  });

  it("return a single result", async () => {
    const result = await controller.get({ id: "1" });
    const expected = { id: 1, name: "admin", scheme: "/scheme/1" };

    chai.expect(result.data).to.deep.equal(expected);
  });

  it("return a 404 if the record does not exist", async () => {
    const result = await controller.get({ id: "4" });

    chai.expect(result.code).to.deep.equal(404);
  });

});
