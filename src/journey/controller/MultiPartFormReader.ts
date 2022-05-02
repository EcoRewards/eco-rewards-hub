import { IncomingMessage } from "http";
import * as busboy from "busboy";
import ReadableStream = NodeJS.ReadableStream;

export class MultiPartFormReader {

  /**
   * Extracts the form and files from the multipart request
   */
  public getForm(input: IncomingMessage): Promise<MultiPartForm> {
    const boy = busboy({ headers: input.headers });
    const form = {};

    input.pipe(boy);

    return new Promise(resolve => {
      boy.on("file", (name, file) => {
        form[name] = file;
        resolve(form);
      });
      boy.on("field", (name, value) => form[name] = value);
      boy.on("finish", () => resolve(form));
    });
  }

}

export type MultiPartForm = Record<string, string | number | ReadableStream>;
