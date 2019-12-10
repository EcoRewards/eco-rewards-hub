import { Readable, Transform, TransformCallback } from "stream";
import { HttpResponse } from "../../service/controller/HttpResponse";
import * as parse from "csv-parse";
import { AdminUserId } from "../../user/AdminUser";
import { JourneyCsvToMySqlStreamFactory } from "../JourneyCsvToMySqlStreamFactory";
import { JourneyRepository } from "../repository/JourneyRepository";
import { Context } from "koa";
import autobind from "autobind-decorator";
import * as Formidable from "formidable";
import * as Busboy from "busboy";

/**
 * Journey endpoints
 */
@autobind
export class JourneyController {

  constructor(
    private readonly repository: JourneyRepository,
    private readonly factory: JourneyCsvToMySqlStreamFactory
  ) { }

  /**
   * Handler for the POST /journey endpoint. Processes the input stream as a CSV of member
   * journeys and returns any errors generated during processing.
   */
  public async post(input: any, ctx: Context): Promise<HttpResponse<JourneyPostResponse>> {
    const errors = await this.processInput(ctx.req, ctx.adminUserId);

    return { data: { errors }, links: {} };
  }

  private async processInput(input: any, adminUserId: AdminUserId): Promise<string[]> {
    const csvToMySql = await this.factory.create(adminUserId);
    const inserts = input
      .pipe(new Transform({ objectMode: true,
        transform(chunk: any, encoding: string, callback: TransformCallback): void {
          console.log(chunk.toString());
          callback(null, chunk.toString());
        }
      }))
      .pipe(parse({ from: 3, bom: true, from_line: 3, relax_column_count: true }))
      .pipe(csvToMySql);

    // const busboy = new Busboy({ headers: input.headers });
    // const file: any = await new Promise(r => {
    //   busboy.on("file", function(name, file, filename, encoding, mimetype) {
    //     r(file);
    //   });
    //   input
    //       .pipe(new Transform({ objectMode: true,
    //         transform(chunk: any, encoding: string, callback: TransformCallback): void {
    //           console.log(chunk.toString());
    //           callback(null, chunk.toString());
    //         }
    //       }))
    //     .pipe(busboy);
    // });
    // const inserts = file
    //   .pipe(parse({ bom: true }))
    //   .pipe(csvToMySql);

    try {
      await this.repository.insertStream(inserts);

      return csvToMySql.getErrors();
    }
    catch (err) {
      return csvToMySql.getErrors().concat(err.message);
    }
  }

}

export interface JourneyPostResponse {
  errors: string[]
}
