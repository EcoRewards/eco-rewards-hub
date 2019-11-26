import * as chai from "chai";
import { GroupViewFactory } from "./GroupViewFactory";

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

describe("GroupViewFactory", () => {
    const repository = new MockRepository({
        1: { id: 1, name: "org", scheme_id: 1 },
        2: { id: 2, name: "org2", scheme_id: 2 }
    }) as any;

    const view = new GroupViewFactory(repository);

    it("creates a view", async () => {
        await view.create();

        chai.expect(repository.called).to.equal(true);
    });

});
