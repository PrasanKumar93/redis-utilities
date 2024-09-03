import { z } from "zod";

import * as InputSchemas from "../input-schema.js";
import {
  getJSONGlobForFolderPath,
  IFileReaderData,
  readSingleJSONFileFromPaths,
  readSingleValueFromJSONArrayFile,
} from "../utils/file-reader.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "../utils/constants.js";
import { getDefaultUploadType } from "./common-api.js";

const getSampleInputForJSONFormatterFn = async (
  input: z.infer<typeof InputSchemas.getSampleInputForJSONFormatterFnSchema>
) => {
  InputSchemas.getSampleInputForJSONFormatterFnSchema.parse(input); // validate input
  let retObj: IFileReaderData | null = null;

  if (!input.uploadType) {
    input.uploadType = getDefaultUploadType(input.uploadPath);
  }

  if (input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER) {
    const jsonGlobArr = getJSONGlobForFolderPath(input.uploadPath);
    retObj = await readSingleJSONFileFromPaths(jsonGlobArr, []);
  } else if (input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE) {
    retObj = await readSingleValueFromJSONArrayFile(input.uploadPath);
  }

  if (retObj?.error) {
    throw retObj?.error;
  }

  delete retObj?.error;
  return retObj;
};

export { getSampleInputForJSONFormatterFn };
