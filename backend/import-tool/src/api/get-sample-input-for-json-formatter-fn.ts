import { z } from "zod";

import * as InputSchemas from "../input-schema.js";
import {
  getJsonGlobForFolderPath,
  IFileReaderData,
  readSampleJsonFileFromPaths,
  readSampleDataFromArrayFile,
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
    const jsonGlobArr = getJsonGlobForFolderPath(input.uploadPath);
    retObj = await readSampleJsonFileFromPaths(jsonGlobArr, []);
  } else if (
    input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE ||
    input.uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE
  ) {
    retObj = await readSampleDataFromArrayFile(
      input.uploadPath,
      input.uploadType
    );
  }

  return retObj;
};

export { getSampleInputForJSONFormatterFn };
