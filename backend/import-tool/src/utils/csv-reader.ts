import type { IFileReaderData } from "./file-reader.js";
import type { IImportStreamFileState } from "../state.js";

import fs from "fs";
import { parse, Parser } from "csv-parse";
import _ from "lodash";
import { ImportStatus } from "../state.js";

type StreamType = fs.ReadStream | Parser | null;
type ResolveCallback = (value: string | PromiseLike<string>) => void;
type RejectCallback = (reason?: any) => void;

const transformHeader = (header: string) => {
  return header ? _.camelCase(header.replace(/\s+/g, "")) : "";
};

const readCSVFileAsStream = (
  filePath: string,
  rowIndex: number,
  importState: IImportStreamFileState,
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
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

  let promObj: Promise<string> = new Promise((resolve, reject) => {
    let stream: fs.ReadStream | Parser | null = null;
    if (filePath) {
      // first time file reading
      const parser = parse({
        // columns: true, // Convert rows to objects using the first row as header
        columns: (header) => {
          const headers: string[] = header.map(transformHeader);
          return headers;
        },
        skip_empty_lines: true, // Skip empty lines
        cast: true, // Dynamically type values (e.g. "123" => 123)
      });
      stream = fs.createReadStream(filePath).pipe(parser);

      stream.on("data", (data) => {
        onDataCallback(stream, data, resolve, reject);
      });
      stream.on("error", (error) => {
        onErrorCallback(stream, error, resolve, reject);
      });
      stream.on("end", onEndCallback);

      importState.stream = stream;
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
      reject("readCSVFileAsStream() : Mandatory parameters are missing!");
    }
  });

  return promObj;
};

export { readCSVFileAsStream };
