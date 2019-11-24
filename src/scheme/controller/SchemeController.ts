import autobind from "autobind-decorator";
import {SchemeRepository} from "../SchemeRepository";
import {HttpError, HttpResponse} from "../../service/HttpResponse";
import {CreateSchemeCommand} from "../command/CreateSchemeCommand";

@autobind
export class SchemeController {

    constructor(private readonly repository: SchemeRepository,
                private readonly schemeCmd: CreateSchemeCommand) {}

    public async post(request: SchemeRequest): Promise<SchemeResponse> {
        let data: SchemeView = {
            id: null,
            name: ""
        };
        let links = {};

        const scheme = this.schemeCmd.run(request.name);
        await scheme.then(res => {
            data.id = res.id;
            data.name = res.name;
        });

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
