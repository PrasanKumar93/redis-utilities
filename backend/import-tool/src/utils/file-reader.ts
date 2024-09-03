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
  error: any;
}

const getJSONGlobForFolderPath = (serverFolderPath: string) => {
  if (serverFolderPath.match(/\\/)) {
    //windows OS path
    serverFolderPath = serverFolderPath.replace(/\\/g, "/");
  }
  if (!serverFolderPath.endsWith("/")) {
    serverFolderPath += "/";
  }
  let jsonGlob = serverFolderPath + "**/*.json";
  let jsonGzGlob = serverFolderPath + "**/*.json.gz";
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
      let content = "";
      let error: any = null;
      try {
        if (filePath.endsWith(".json.gz")) {
          content = await decompressGZip(filePath);
        } else {
          content = await fs.readFile(filePath, "utf8");
        }
        content = JSON.parse(content);
      } catch (err) {
        content = "";
        error = LoggerCls.getPureError(err);
        LoggerCls.error(`Error reading/ parsing file:  ${filePath}`, error);
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

const readSingleJSONFileFromPaths = async (
  include: string[],
  exclude: string[] = []
) => {
  const retObj: IFileReaderData = {
    totalFiles: 0,
    filePath: "",
    fileIndex: 0,
    content: "",
    error: null,
  };

  let filePaths = await getFilePathsFromGlobPattern(include, exclude);

  if (filePaths?.length > 0) {
    retObj.totalFiles = filePaths.length;

    const isStopOnError = false;
    const startIndex = 0;
    const state: IImportFilesState = {
      isPaused: false,
    };

    await readJsonFilesFromPaths(
      filePaths,
      isStopOnError,
      startIndex,
      state,
      async (data) => {
        if (!data.error && data.content) {
          retObj.filePath = data.filePath;
          retObj.fileIndex = data.fileIndex;
          retObj.content = data.content;

          state.isPaused = true; // stop reading after one file
        }
      }
    );
  } else {
    retObj.error = `No file found for the given path: ${include.join(", ")}`;
  }

  return retObj;
};

const readJSONArrayFileFromPath = async (filePath: string) => {
  let fileContents: any[] = [];

  try {
    let content = "";
    if (filePath.endsWith(".json.gz")) {
      content = await decompressGZip(filePath);
    } else {
      content = await fs.readFile(filePath, "utf8");
    }
    fileContents = JSON.parse(content);

    if (!Array.isArray(fileContents)) {
      throw new Error("File content is not an array in " + filePath);
    }
  } catch (err) {
    LoggerCls.error(`Error reading file:  ${filePath}`, err);
    throw err;
  }

  return fileContents;
};

const loadItemsFromArray = async (
  fileContents: any[],
  isStopOnError: boolean = false,
  startIndex: number = 0,
  importState: IImportArrayFileState | null = null,
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
  // similar to readJsonFilesFromPaths

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

const readSingleValueFromJSONArrayFile = async (filePath: string) => {
  const retObj: IFileReaderData = {
    totalFiles: 0,
    filePath: "",
    fileIndex: 0,
    content: "",
    error: null,
  };

  try {
    let fileContents = await readJSONArrayFileFromPath(filePath);

    if (fileContents?.length > 0) {
      retObj.totalFiles = fileContents.length;
      retObj.filePath = filePath;
      retObj.fileIndex = 0;
      retObj.content = fileContents[0];
    } else {
      retObj.error = `No item found in the file: ${filePath}`;
    }
  } catch (err) {
    retObj.error = err;
  }

  return retObj;
};

export {
  getFilePathsFromGlobPattern,
  getJSONGlobForFolderPath,
  readJsonFilesFromPaths,
  readSingleJSONFileFromPaths,
  readJSONArrayFileFromPath,
  loadItemsFromArray,
  readSingleValueFromJSONArrayFile,
};

export type { IFileReaderData };
