import type { IImportFilesState } from "../state.js";

import fs from "fs-extra";
import fg from "fast-glob";

import { LoggerCls } from "./logger.js";

interface IFileReaderData {
  filePath: string;
  content: string;
  totalFiles: number;
  error: any;
  filePathIndex: number;
}
const readFiles = async (
  include: string[],
  exclude: string[] = [],
  isStopOnError: boolean = false,
  storeFilePaths: string[] = [],
  importState: IImportFilesState | null = null,
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
  //glob patterns like ["path/**/*.ts", "**/*.?s", ...]
  if (include?.length) {
    let filePaths = await fg(include, {
      caseSensitiveMatch: false,
      dot: true, // allow files that begin with a period (.)
      ignore: exclude,
    });

    storeFilePaths.push(...filePaths);
    let startIndex = 0;
    await readFilesExt(
      filePaths,
      isStopOnError,
      startIndex,
      importState,
      recursiveCallback
    );
  }
};
const readFilesExt = async (
  filePaths: string[],
  isStopOnError: boolean = false,
  startIndex: number = 0,
  importState: IImportFilesState | null = null,
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
  //glob patterns like ["path/**/*.ts", "**/*.?s", ...]
  if (filePaths?.length) {
    const totalFiles = filePaths.length;
    if (filePaths?.length) {
      for (let i = startIndex; i < filePaths.length; i++) {
        let filePathIndex = i;
        const filePath = filePaths[filePathIndex];
        let content = "";
        let error: any = null;
        try {
          content = await fs.readFile(filePath, "utf8");
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
          filePathIndex,
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
  }
};

const readSingleFileFromPaths = async (
  include: string[],
  exclude: string[] = []
) => {
  let filePath = "";
  let content = "";
  let error: any = null;

  //glob patterns like ["path/**/*.ts", "**/*.?s", ...]
  let filePaths = await fg(include, {
    caseSensitiveMatch: false,
    dot: true, // allow files that begin with a period (.)
    ignore: exclude,
  });

  if (filePaths?.length > 0) {
    const loopCount = filePaths.length > 3 ? 3 : filePaths.length; // try to read 3 files max in case of error

    for (let i = 0; i < loopCount; i++) {
      filePath = filePaths[i];

      try {
        error = null;
        content = await fs.readFile(filePath, "utf8");
        content = JSON.parse(content);

        break; // read only one file successfully
      } catch (err) {
        content = "";
        error = LoggerCls.getPureError(err);
        LoggerCls.error(
          `Error in readSingleFileFromPaths :  ${filePath}`,
          error
        );
      }
    }
  } else {
    error = `No file found for the given path: ${include.join(", ")}`;
  }

  return { filePath, content, error };
};

export { readFiles, readFilesExt, readSingleFileFromPaths };

export type { IFileReaderData };
