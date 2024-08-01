import fs from "fs-extra";
import fg from "fast-glob";

import { LoggerCls } from "./logger.js";

interface IFileReaderData {
  filePath: string;
  content: string;
  totalFiles: number;
  error: any;
}

const readFiles = async (
  include: string[],
  exclude: string[] = [],
  isStopOnError: boolean = false,
  recursiveCallback: (data: IFileReaderData) => Promise<void>
) => {
  //glob patterns like ["path/**/*.ts", "**/*.?s", ...]

  if (include?.length) {
    const filePaths = await fg(include, {
      caseSensitiveMatch: false,
      dot: true, // allow files that begin with a period (.)
      ignore: exclude,
    });

    const totalFiles = filePaths.length;
    if (filePaths?.length) {
      for (const filePath of filePaths) {
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
        });
        if (error && isStopOnError) {
          break;
        }
      }
    }
  }
};

export { readFiles };

export type { IFileReaderData };
