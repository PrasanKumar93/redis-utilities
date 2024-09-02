import { z } from "zod";

import * as InputSchemas from "../input-schema.js";
import {
  getJSONGlobForFolderPath,
  readSingleJSONFileFromPaths,
} from "../utils/file-reader.js";

const getSampleInputForJSONFormatterFn = async (
  input: z.infer<typeof InputSchemas.getSampleInputForJSONFormatterFnSchema>
) => {
  InputSchemas.getSampleInputForJSONFormatterFnSchema.parse(input); // validate input

  const jsonGlobArr = getJSONGlobForFolderPath(input.serverFolderPath);
  const { filePath, content, error } = await readSingleJSONFileFromPaths(
    jsonGlobArr,
    []
  );

  if (error) {
    throw error;
  }
  return { filePath, content };
};

export { getSampleInputForJSONFormatterFn };
