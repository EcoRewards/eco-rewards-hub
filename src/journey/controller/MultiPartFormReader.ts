import { IncomingMessage } from "http";
import * as Busboy from "busboy";
import ReadableStream = NodeJS.ReadableStream;

export class MultiPartFormReader {

  /**
   * Extracts the form and files from the multipart request
   */
  public getForm(input: IncomingMessage): Promise<MultiPartForm> {
    const busboy = new Busboy({ headers: input.headers });
    const form = {};

    input.pipe(busboy);

    return new Promise(resolve => {
      busboy.on("file", (name, file) => {
        form[name] = file;
        resolve(form);
      });
      busboy.on("field", (name, value) => form[name] = value);
      busboy.on("finish", () => resolve(form));
    });
  }

  /**
   * Extracts the first file multipart request
   */
  public getFirstFile(input: IncomingMessage): Promise<ReadableStream> {
    const busboy = new Busboy({ headers: input.headers });
    const form = {};

    input.pipe(busboy);

    return new Promise(resolve => {
      busboy.on("file", (name, file) => resolve(file));
    });
  }

}

export type MultiPartForm = Record<string, string | number | ReadableStream>;
