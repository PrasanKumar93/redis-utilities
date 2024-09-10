import { z } from "zod";

import { resumeImportJSONFilesToRedis } from "./resume-import-json-files-to-redis.js";
import { resumeImportArrayFileToRedis } from "./resume-import-array-file-to-redis.js";
import { getDefaultUploadType } from "../common-api.js";
import * as InputSchemas from "../../input-schema.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "../../utils/constants.js";

const resumeImportDataToRedis = async (
  resumeInput: z.infer<typeof InputSchemas.resumeImportDataToRedisSchema>
) => {
  InputSchemas.resumeImportDataToRedisSchema.parse(resumeInput); // validate input

  let retObj: any = {};

  if (!resumeInput.uploadType) {
    resumeInput.uploadType = getDefaultUploadType(resumeInput.uploadPath);
  }

  if (resumeInput.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER) {
    retObj = await resumeImportJSONFilesToRedis(resumeInput);
  } else if (
    resumeInput.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE ||
    resumeInput.uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE
  ) {
    retObj = await resumeImportArrayFileToRedis(resumeInput);
  }

  return retObj;
};

export { resumeImportDataToRedis };
