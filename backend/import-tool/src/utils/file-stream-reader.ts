import type { IFileReaderData } from "./file-reader.js";
import type { IImportStreamFileState } from "../state.js";

import fs from "fs";
import { parse, Parser } from "csv-parse";
import _ from "lodash";

import { UPLOAD_TYPES_FOR_IMPORT } from "./constants.js";
import { ImportStatus } from "../state.js";

type StreamType = fs.ReadStream | Parser | null;
type ResolveCallback = (value: string | PromiseLike<string>) => void;
type RejectCallback = (reason?: any) => void;

const transformHeader = (header: string) => {
  return header ? _.camelCase(header.replace(/\s+/g, "")) : "";
};

const readCSVFileStream = (filePath: string) => {
  const parser = parse({
    // columns: true, // Convert rows to objects using the first row as header
    columns: (header) => {
      const headers: string[] = header.map(transformHeader);
      return headers;
    },
    skip_empty_lines: true, // Skip empty lines
    cast: true, // Dynamically type values (e.g. "123" => 123)
  });
  const stream = fs.createReadStream(filePath).pipe(parser);

  return stream;
};

const readFileAsStream = (
  filePath: string,
  fileType: string,
  rowIndex: number,
  importState: IImportStreamFileState,
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
  //#region Stream event handlers
  const onDataCallback = async (
    stream: StreamType,
    row: any,
    resolveCallback: ResolveCallback,
    rejectCallback: RejectCallback
  ) => {
    if (stream) {
      stream.pause(); // Pause the stream to process the current row

      // Process the row
      await recursiveCallback({
        filePath: "",
        content: row,
        totalFiles: -1,
        error: null,
        fileIndex: rowIndex,
      });
      rowIndex++;

      if (importState.currentStatus == ImportStatus.ERROR_STOPPED) {
        stream.pause();
        resolveCallback("Stopped on error");
      } else if (importState.currentStatus == ImportStatus.PAUSED) {
        stream.pause();
        resolveCallback("Paused on user request");
      } else if (importState.isStreamEnded) {
        resolveCallback("CSV processing completed");
      } else {
        stream.resume(); // Resume the stream to read the next row
      }
    }
  };

  const onErrorCallback = (
    stream: StreamType,
    error: any,
    resolveCallback: ResolveCallback,
    rejectCallback: RejectCallback
  ) => {
    if (stream) {
      stream.pause();
      rejectCallback(error);
    }
  };

  const onEndCallback = () => {
    importState.isStreamEnded = true;
  };
  //#endregion

  let promObj: Promise<string> = new Promise((resolve, reject) => {
    let stream: fs.ReadStream | Parser | null = null;
    if (filePath) {
      // first time file reading
      if (fileType === UPLOAD_TYPES_FOR_IMPORT.CSV_FILE) {
        stream = readCSVFileStream(filePath);
      }

      if (stream) {
        stream.on("data", (data) => {
          onDataCallback(stream, data, resolve, reject);
        });
        stream.on("error", (error) => {
          onErrorCallback(stream, error, resolve, reject);
        });
        stream.on("end", onEndCallback);

        importState.stream = stream;
      }
    } else if (importState.stream) {
      // on resume file reading
      stream = importState.stream;

      if (stream) {
        stream.removeAllListeners("data");
        stream.removeAllListeners("error");
        stream.removeAllListeners("end");

        stream.on("data", (data) => {
          onDataCallback(stream, data, resolve, reject);
        });
        stream.on("error", (error) => {
          onErrorCallback(stream, error, resolve, reject);
        });
        stream.on("end", onEndCallback);

        stream.resume();
      }
    } else {
      reject("readFileAsStream() : Mandatory parameters are missing!");
    }
  });

  return promObj;
};

export { readFileAsStream };
