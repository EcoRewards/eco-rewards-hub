import {SchemeController} from "./SchemeController";
import * as chai from "chai";

interface Scheme {
  id: number | null,
  name: string
}

class MockOrganisationRepository {
    data: Scheme[] = [];

    public async save(scheme: Scheme) {
        this.data.push(scheme);
        return this.data.pop();
    }
}

class MockCreateSchemeCommand {

    constructor(private repository: MockOrganisationRepository) {
    }
    public async run(name: string) {
        return this.repository.save({ id: 0, name });
    }
}

describe("SchemeController", () => {
    const repository = new MockOrganisationRepository();

    const controller = new SchemeController(
       repository as any,
       new MockCreateSchemeCommand(repository) as any
   );

    it("should create a scheme", async () => {
        const result = await controller.post({ name: "scheme" }) as any;

        chai.expect(result.data.name).equal("scheme");
    });
});
