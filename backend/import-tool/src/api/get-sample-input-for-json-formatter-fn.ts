import { z } from "zod";

import { getDefaultUploadType } from "./common-api.js";
import * as InputSchemas from "../input-schema.js";
import {
  getJsonGlobForFolderPath,
  IFileReaderData,
  readSingleJsonFileFromPaths,
} from "../utils/file-reader.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "../utils/constants.js";
import { readSingleEntryFromStreamFile } from "../utils/file-stream-reader.js";

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
    retObj = await readSingleJsonFileFromPaths(jsonGlobArr, []);
  } else if (
    input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE ||
    input.uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE
  ) {
    retObj = await readSingleEntryFromStreamFile(
      input.uploadPath,
      input.uploadType
    );
  }

  return retObj;
};

export { getSampleInputForJSONFormatterFn };
