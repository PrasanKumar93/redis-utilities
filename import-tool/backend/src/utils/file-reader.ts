import fs from "fs-extra";
import fg from "fast-glob";

const readFiles = async (
  include: string[],
  exclude: string[] = [],
  recursiveCallback: (data: {
    filePath: string;
    content: string;
    totalFiles: number;
    error: any;
  }) => Promise<void>
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
          console.log(`Read file:  ${filePath}`);
        } catch (err) {
          error = err;
          console.error(`Error reading file:  ${filePath}`, err);
        }
        await recursiveCallback({
          filePath,
          content,
          totalFiles,
          error,
        });
      }
    }
  }
};

export { readFiles };
