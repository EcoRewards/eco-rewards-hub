import { IncomingMessage } from "http";
import * as Busboy from "busboy";

export class MultiPartFileExtractor {

  /**
   * Extracts the file from the multipart request
   */
  public getFile(input: IncomingMessage): Promise<NodeJS.ReadableStream> {
    return new Promise(r => {
      const busboy = new Busboy({ headers: input.headers });

      busboy.on("file", (name, file) => r(file));
      input.pipe(busboy);
    });
  }

}