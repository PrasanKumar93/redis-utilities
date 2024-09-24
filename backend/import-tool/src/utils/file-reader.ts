import type { IImportFilesState, IImportArrayFileState } from "../state.js";

import fs from "fs-extra";
import fg from "fast-glob";
import zlib from "node:zlib";
import path from "node:path";
import _ from "lodash";
import Papa from "papaparse";
import yauzl from "yauzl";

import { LoggerCls } from "./logger.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "./constants.js";
import { ImportStatus } from "../state.js";

interface IFileReaderData {
  filePath: string;
  fileIndex: number;

  content: any;
  totalFiles: number;
  error?: any;
}
interface IUnzipFile {
  userMessage: string;
  unzippedPath: string;
}

const getJsonGlobForFolderPath = (folderPath: string) => {
  if (folderPath.match(/\\/)) {
    //windows OS path
    folderPath = folderPath.replace(/\\/g, "/");
  }
  if (!folderPath.endsWith("/")) {
    folderPath += "/";
  }
  let jsonGlob = folderPath + "**/*.json";
  let jsonGzGlob = folderPath + "**/*.json.gz";
  return [jsonGlob, jsonGzGlob];
};

const decompressGZip = async (filePath: string) => {
  let content = "";

  try {
    let buffer = await fs.readFile(filePath);

    // Check if the buffer starts with the gzip magic number
    const isCompressed = buffer[0] === 0x1f && buffer[1] === 0x8b;

    if (isCompressed) {
      buffer = zlib.gunzipSync(buffer);
    }
    content = buffer.toString("utf-8");
  } catch (err) {
    LoggerCls.error(`Error in decompressFileContent`, err);
    throw err;
  }

  return content;
};

const getFilePathsFromGlobPattern = async (
  include: string[],
  exclude: string[] = []
) => {
  let filePaths: string[] = [];
  //glob patterns like ["path/**/*.ts", "**/*.?s", ...]
  if (include?.length) {
    filePaths = await fg(include, {
      caseSensitiveMatch: false,
      dot: true, // allow files that begin with a period (.)
      ignore: exclude,
    });
  }

  return filePaths;
};

const readRawJSONFile = async (
  filePath: string,
  isJsonArrayFile: boolean = false
) => {
  let content: any = null;
  if (filePath) {
    try {
      if (filePath.endsWith(".json.gz")) {
        content = await decompressGZip(filePath);
      } else {
        content = await fs.readFile(filePath, "utf8");
      }
      content = JSON.parse(content);
    } catch (err) {
      err = LoggerCls.getPureError(err);
      LoggerCls.error(`Error reading/ parsing JSON file:  ${filePath}`, err);
      throw err;
    }

    if (isJsonArrayFile) {
      if (!Array.isArray(content)) {
        throw "File content is not an array in " + filePath;
      }
    }
  }
  return content;
};

const readJsonFilesFromPaths = async (
  filePaths: string[],
  startIndex: number = 0,
  importState: IImportFilesState | null = null,
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
  //glob patterns like ["path/**/*.ts", "**/*.?s", ...]
  if (filePaths?.length) {
    const totalFiles = filePaths.length;
    for (let i = startIndex; i < filePaths.length; i++) {
      let fileIndex = i;
      const filePath = filePaths[fileIndex];
      let error: any = null;
      let content: any = null;

      try {
        content = await readRawJSONFile(filePath, false);
      } catch (err) {
        error = err;
      }
      await recursiveCallback({
        filePath,
        content,
        totalFiles,
        error,
        fileIndex,
      });

      if (importState?.currentStatus == ImportStatus.ERROR_STOPPED) {
        LoggerCls.error("Stopped on error");
        break;
      } else if (importState?.currentStatus == ImportStatus.PAUSED) {
        LoggerCls.info("Paused on user request");
        break;
      }
    }
  }
};

const readSampleJsonFileFromPaths = async (
  include: string[],
  exclude: string[] = []
) => {
  const retObj: IFileReaderData = {
    totalFiles: 0,
    filePath: "",
    fileIndex: 0,
    content: "",
  };

  let filePaths = await getFilePathsFromGlobPattern(include, exclude);

  if (filePaths?.length > 0) {
    retObj.totalFiles = filePaths.length;
    retObj.filePath = filePaths[0];
    retObj.fileIndex = 0;
    retObj.content = await readRawJSONFile(filePaths[0], false);
  } else {
    throw `No file found for the given path: ${include.join(", ")}`;
  }

  return retObj;
};

const loopJsonArrayFileContents = async (
  fileContents: any[] = [],
  isStopOnError: boolean = false,
  startIndex: number = 0,
  importState: IImportArrayFileState | null = null,
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
  // structure similar to readJsonFilesFromPaths

  if (fileContents?.length) {
    const totalFiles = fileContents.length;
    for (let i = startIndex; i < fileContents.length; i++) {
      let fileIndex = i;
      let content = fileContents[fileIndex];
      let error: any = null;
      await recursiveCallback({
        filePath: "",
        content,
        totalFiles,
        error,
        fileIndex,
      });

      if (importState?.currentStatus == ImportStatus.ERROR_STOPPED) {
        LoggerCls.error("Stopped on error");
        break;
      } else if (importState?.currentStatus == ImportStatus.PAUSED) {
        LoggerCls.info("Paused on user request");
        break;
      }
    }
  }
};

const readSampleDataFromArrayFile = async (
  filePath: string,
  uploadType: string
) => {
  const retObj: IFileReaderData = {
    totalFiles: 0,
    filePath: "",
    fileIndex: 0,
    content: "",
  };

  let fileContents: any[] = [];

  if (uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE) {
    fileContents = await readRawJSONFile(filePath, true);
  } else if (uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE) {
    fileContents = await readRawCSVFile(filePath);
  }

  if (fileContents?.length > 0) {
    retObj.totalFiles = fileContents.length;
    retObj.filePath = filePath;
    retObj.fileIndex = 0;
    retObj.content = fileContents[0];
  } else {
    throw `No item found in the file: ${filePath}`;
  }

  return retObj;
};

const readRawCSVFile = async (filePath: string) => {
  const results: any[] = [];

  if (filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");

      Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (parsedData) => {
          if (parsedData?.meta?.fields && parsedData.data?.length) {
            const colNames = parsedData.meta.fields;
            const rows = parsedData.data;
            const casedColNames = colNames.map((colName) =>
              _.camelCase(colName)
            );

            rows.forEach((row: any) => {
              const formattedData: any = {};
              casedColNames.forEach((casedColName, index) => {
                formattedData[casedColName] = row[colNames[index]];
              });
              results.push(formattedData);
            });
          }
        },
        error: (err: any) => {
          err = LoggerCls.getPureError(err);
          LoggerCls.error(`Error parsing CSV file: ${filePath}`, err);
          throw err;
        },
      });
    } catch (err) {
      LoggerCls.error(`Error reading/ parsing CSV file: ${filePath}`, err);
      throw err;
    }
  }

  return results;
};

const unzipFile = async (zipFilePath: string, destDir: string) => {
  const retObj: IUnzipFile = {
    userMessage: "",
    unzippedPath: "",
  };

  let promObj: Promise<IUnzipFile> = new Promise((resolve, reject) => {
    yauzl.open(zipFilePath, { lazyEntries: true }, (errOpenZip, zipFile) => {
      const handleZipError = (err: Error, isCloseFile = true) => {
        reject(err);
        if (isCloseFile) {
          zipFile.close();
        }
      };

      if (errOpenZip) {
        handleZipError(errOpenZip, false);
      } else {
        zipFile.readEntry(); // read the first entry

        zipFile.on("entry", (entry) => {
          const filePath = path.join(destDir, entry.fileName);

          if (/\/$/.test(entry.fileName)) {
            // if entry.fileName is Directory
            fs.mkdirSync(filePath, { recursive: true });
            zipFile.readEntry(); // read the next entry
          } else {
            // if entry.fileName is File
            fs.mkdirSync(path.dirname(filePath), { recursive: true });

            // Extract file
            zipFile.openReadStream(entry, (errOpenFile, readStream) => {
              LoggerCls.info("Extracting file: " + filePath);

              if (errOpenFile) {
                handleZipError(errOpenFile);
              } else {
                const writeStream = fs.createWriteStream(filePath);
                readStream.pipe(writeStream);

                readStream.on("error", handleZipError);
                writeStream.on("error", handleZipError);

                readStream.on("end", function () {
                  zipFile.readEntry(); // read the next entry
                });
              }
            });
          }
        });

        zipFile.on("end", () => {
          retObj.userMessage = "Unzipping completed at : " + destDir;
          LoggerCls.info(retObj.userMessage);
          retObj.unzippedPath = destDir;
          resolve(retObj);
        });

        zipFile.on("error", handleZipError);
      }
    });
  });

  return promObj;
};

export {
  getFilePathsFromGlobPattern,
  getJsonGlobForFolderPath,
  readJsonFilesFromPaths,
  readSampleJsonFileFromPaths,
  loopJsonArrayFileContents,
  readSampleDataFromArrayFile,
  readRawJSONFile,
  readRawCSVFile,
  unzipFile,
};

export type { IFileReaderData };
