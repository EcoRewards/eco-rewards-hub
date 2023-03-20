import { Context } from "koa";
import autobind from "autobind-decorator";
import { GetAllResponse, PaginatedRequest, PaginatedResults } from "../../service/controller/ReadController";
import { Trophy, TrophyJsonView } from "../Trophy";
import { Filter, GenericRepository } from "../../database/GenericRepository";
import { TrophyViewFactory } from "../TrophyViewFactory";

/**
 * /journeys endpoints
 */
@autobind
export class TrophiesController {

  constructor(
    private readonly repository: GenericRepository<Trophy>,
    private readonly viewFactory: TrophyViewFactory
  ) { }

  /**
   * Return a list of items
   */
  public async getAll(
    { page, quantity, filterText, filterField }: PaginatedRequest, ctx: Context
  ): Promise<GetAllResponse<TrophyJsonView> | void> {

    const links = {};
    const filter = filterField && filterText ? ({ text: filterText, field: filterField}) : undefined;

    const [{ rows, pagination }, view] = await Promise.all([
      this.getResults(page, quantity, filter),
      this.viewFactory.create()
    ]);

    const accepts = ctx.request.accept.types();

    if (accepts && accepts.includes("text/csv")) {
      const head = "trophy,member,date_awarded,group,rewards,carbon_saving,miles\n";
      const csvData = rows
        .map(m => view.createCsv(links, m).join(","))
        .join("\n");

      ctx.set("Content-disposition", "attachment; filename=trophies.csv");
      ctx.status = 200;
      ctx.body = head + csvData;
    } else {
      const data = rows.map(m => view.create(links, m));

      return { data, links, pagination };
    }
  }

  private async getResults(
    page?: string, quantity?: string, filter?: Filter
  ): Promise<PaginatedResults<Trophy>> {
    if (page && quantity) {
      const filters = filter ? [filter] : [];

      return this.repository.selectPaginated(+page, +quantity, filters);
    } else {
      const rows = await this.repository.selectAll();

      return { rows };
    }
  }

}
