import type { IFileReaderData } from "./file-reader.js";
import type { IImportStreamFileState } from "../state.js";

import fs from "fs";
import * as csvParse from "csv-parse";
import _ from "lodash";
import streamJsonPkg from "stream-json";
import streamJsonArrayPkg from "stream-json/streamers/StreamArray.js";

import { LoggerCls } from "./logger.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "./constants.js";
import { ImportStatus } from "../state.js";

type StreamType = fs.ReadStream | csvParse.Parser | null;
type ResolveCallback = (value: string | PromiseLike<string>) => void;
type RejectCallback = (reason?: any) => void;

const transformCsvHeaderRow = (header: string) => {
  // Remove spaces and convert to camelCase
  return header ? _.camelCase(header.replace(/\s+/g, "")) : "";
};

const getCsvFileStream = (filePath: string) => {
  const parser = csvParse.parse({
    // columns: true, // Convert rows to objects using the first row as header
    columns: (header) => {
      const headers: string[] = header.map(transformCsvHeaderRow);
      return headers;
    },
    skip_empty_lines: true, // Skip empty lines
    cast: true, // Dynamically type values (e.g. "123" => 123)
  });
  const stream = fs.createReadStream(filePath).pipe(parser);

  return stream;
};

const getJsonFileStream = (filePath: string) => {
  const stream = fs
    .createReadStream(filePath)
    .pipe(streamJsonPkg.parser())
    .pipe(streamJsonArrayPkg.streamArray());

  return stream;
};

const getFileTotalEntriesCount = (
  filePath: string,
  fileType: string,
  recursiveCallback?: (count: number) => void
) => {
  let promObj: Promise<number> = new Promise((resolve, reject) => {
    let count = 0;
    let stream: StreamType = null;

    if (fileType === UPLOAD_TYPES_FOR_IMPORT.CSV_FILE) {
      stream = getCsvFileStream(filePath);
    } else if (fileType === UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE) {
      //@ts-ignore
      stream = getJsonFileStream(filePath);
    }

    if (stream) {
      stream.on("data", () => {
        count++;
        if (count % 2000 == 0 && recursiveCallback) {
          // Update progress every 2000 rows to reduce memory footprint
          recursiveCallback(count);
        }
      });
      stream.on("end", () => {
        if (recursiveCallback) {
          recursiveCallback(count);
        }
        resolve(count);
      });
      stream.on("error", (error) => {
        reject(error);
      });
    }
  });

  return promObj;
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
      if (!importState.isStreamStarted) {
        importState.isStreamStarted = true;
      }

      stream.pause(); // Pause the stream to process the current row

      if (fileType === UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE && row.value) {
        row = row.value; // row.key is the index of the row in the JSON array
      }
      // Process the row
      await recursiveCallback({
        filePath: "",
        content: row,
        totalFiles: 0,
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

  const onEndCallback = (
    resolveCallback: ResolveCallback,
    rejectCallback: RejectCallback
  ) => {
    importState.isStreamEnded = true;

    if (!importState.isStreamStarted) {
      //empty file
      resolveCallback("No data was read from the file");
    }
  };
  //#endregion

  let promObj: Promise<string> = new Promise((resolve, reject) => {
    let stream: StreamType = null;
    if (filePath) {
      // first time file reading
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        reject(`Empty file error: The file ${filePath} is empty.`);
      } else if (fileType === UPLOAD_TYPES_FOR_IMPORT.CSV_FILE) {
        stream = getCsvFileStream(filePath);
      } else if (fileType === UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE) {
        //@ts-ignore
        stream = getJsonFileStream(filePath);
      }

      if (stream) {
        stream.on("data", (data) => {
          onDataCallback(stream, data, resolve, reject);
        });
        stream.on("error", (error) => {
          onErrorCallback(stream, error, resolve, reject);
        });
        stream.on("end", () => {
          onEndCallback(resolve, reject);
        });

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
        stream.on("end", () => {
          onEndCallback(resolve, reject);
        });

        stream.resume();
      }
    } else {
      reject("readFileAsStream() : Mandatory parameters are missing!");
    }
  });

  return promObj;
};

const readSingleEntryFromStreamFile = async (
  filePath: string,
  uploadType: string
) => {
  const retObj: IFileReaderData = {
    filePath: filePath,
    fileIndex: 0,
    totalFiles: 0,
    content: "",
  };

  if (
    uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE ||
    uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE
  ) {
    const importState: IImportStreamFileState = {
      currentStatus: ImportStatus.IN_PROGRESS,
    };
    const msg = await readFileAsStream(
      filePath,
      uploadType,
      0,
      importState,
      async (data) => {
        retObj.content = data.content;
        importState.currentStatus = ImportStatus.PAUSED;
      }
    );
    LoggerCls.info(msg);

    if (!retObj.content) {
      throw `No item found in the file: ${filePath}`;
    }
  }

  return retObj;
};

export {
  readFileAsStream,
  readSingleEntryFromStreamFile,
  getFileTotalEntriesCount,
};
