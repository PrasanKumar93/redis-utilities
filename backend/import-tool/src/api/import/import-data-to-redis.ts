import { z } from "zod";
import * as InputSchemas from "../../input-schema.js";

import { importJSONFilesToRedis } from "./import-json-files-to-redis.js";
import { importArrayFileToRedis } from "./import-array-file-to-redis.js";
import { getDefaultUploadType } from "../common-api.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "../../utils/constants.js";

const importDataToRedis = async (
  input: z.infer<typeof InputSchemas.importDataToRedisSchema>
) => {
  InputSchemas.importDataToRedisSchema.parse(input); // validate input
  let retObj: any = {};

  if (!input.uploadType) {
    input.uploadType = getDefaultUploadType(input.uploadPath);
  }

  if (input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER) {
    retObj = await importJSONFilesToRedis(input);
  } else if (
    input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE ||
    input.uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE
  ) {
    retObj = await importArrayFileToRedis(input);
  }

  return retObj;
};

export { importDataToRedis };
