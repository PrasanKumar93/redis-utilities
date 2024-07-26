import fs from "fs-extra";
import fg from "fast-glob";

const readFiles = async (
  include: string[],
  exclude: string[] = [],
  recursiveCallback: (filePath: string, content: string) => void
) => {
  //glob patterns like ["path/**/*.ts", "**/*.?s", ...]

  if (include?.length) {
    const filePaths = await fg(include, {
      caseSensitiveMatch: false,
      dot: true, // allow files that begin with a period (.)
      ignore: exclude,
    });

    await Promise.all(
      filePaths.map(async (filePath) => {
        const content = await fs.readFile(filePath, "utf8");
        console.log(`Read file:  ${filePath}`);
        recursiveCallback(filePath, content);
      })
    );
  }
};

export { readFiles };
