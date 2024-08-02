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
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
  //glob patterns like ["path/**/*.ts", "**/*.?s", ...]
  if (include?.length) {
    const filePaths = await fg(include, {
      caseSensitiveMatch: false,
      dot: true, // allow files that begin with a period (.)
      ignore: exclude,
    });
    storeFilePaths.push(...filePaths);
    let startIndex = 0;
    await readFilesExt(filePaths, isStopOnError, startIndex, recursiveCallback);
  }
};
const readFilesExt = async (
  filePaths: string[],
  isStopOnError: boolean = false,
  startIndex: number = 0,
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
        }
      }
    }
  }
};

export { readFiles, readFilesExt };

export type { IFileReaderData };
