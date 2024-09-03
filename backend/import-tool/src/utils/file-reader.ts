import type { IImportFilesState, IImportArrayFileState } from "../state.js";

import fs from "fs-extra";
import fg from "fast-glob";
import zlib from "node:zlib";

import { LoggerCls } from "./logger.js";

interface IFileReaderData {
  filePath: string;
  fileIndex: number;

  content: any;
  totalFiles: number;
  error?: any;
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
      LoggerCls.error(`Error reading/ parsing JSON file:  ${filePath}`, err);
      throw err;
    }

    if (isJsonArrayFile) {
      if (!Array.isArray(content)) {
        throw new Error("File content is not an array in " + filePath);
      }
    }
  }
  return content;
};

const readJsonFilesFromPaths = async (
  filePaths: string[],
  isStopOnError: boolean = false,
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

      if (error && isStopOnError) {
        LoggerCls.error("Stopped on error");
        break;
      } else if (importState?.isPaused) {
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
    throw new Error(`No file found for the given path: ${include.join(", ")}`);
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

      // if (error && isStopOnError) {
      //   LoggerCls.error("Stopped on error");
      //   break;
      // } else
      if (importState?.isPaused) {
        LoggerCls.info("Paused on user request");
        break;
      }
    }
  }
};

const readSampleDataFromJSONArrayFile = async (filePath: string) => {
  const retObj: IFileReaderData = {
    totalFiles: 0,
    filePath: "",
    fileIndex: 0,
    content: "",
  };

  let fileContents: any[] = await readRawJSONFile(filePath, true);

  if (fileContents?.length > 0) {
    retObj.totalFiles = fileContents.length;
    retObj.filePath = filePath;
    retObj.fileIndex = 0;
    retObj.content = fileContents[0];
  } else {
    throw new Error(`No item found in the file: ${filePath}`);
  }

  return retObj;
};

export {
  getFilePathsFromGlobPattern,
  getJsonGlobForFolderPath,
  readJsonFilesFromPaths,
  readSampleJsonFileFromPaths,
  loopJsonArrayFileContents,
  readSampleDataFromJSONArrayFile,
  readRawJSONFile,
};

export type { IFileReaderData };
