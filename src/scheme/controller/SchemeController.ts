import autobind from "autobind-decorator";
import { CreateSchemeCommand } from "../command/CreateSchemeCommand";
import { GenericRepository } from "../../database/GenericRepository";
import { Scheme } from "../Scheme";
import { HttpError, HttpResponse } from "../../service/controller/HttpResponse";

@autobind
export class SchemeController {

  constructor(
    private readonly repository: GenericRepository<Scheme>,
    private readonly schemeCmd: CreateSchemeCommand
  ) {}

    public async post(request: SchemeRequest): Promise<SchemeResponse> {
      const links = {};
      const data = await this.schemeCmd.run(request.name);

      return { data, links, code: 201 };
    }
}

interface SchemeRequest {
  name: string
}

interface SchemeView {
  id: number | null,
  name: string
}

export type SchemeResponse = HttpResponse<SchemeView | HttpError>;
