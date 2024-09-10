import type { IImportArrayFileState } from "../../state.js";

import _ from "lodash";
import { z } from "zod";

import {
  readEachFileCallback,
  emitSocketMessages,
  setImportTimeAndStatus,
  getInitialImportState,
} from "./common-import.js";
import { getInputRedisConUrl } from "../common-api.js";

import * as InputSchemas from "../../input-schema.js";
import { RedisWrapper } from "../../utils/redis.js";
import { validateJS } from "../../utils/validate-js.js";
import {
  DISABLE_JS_FLAGS,
  UPLOAD_TYPES_FOR_IMPORT,
} from "../../utils/constants.js";
import {
  readRawJSONFile,
  loopJsonArrayFileContents,
  readRawCSVFile,
} from "../../utils/file-reader.js";

const importArrayFileToRedis = async (
  input: z.infer<typeof InputSchemas.importDataToRedisSchema>
) => {
  // Validate input ----------------------
  InputSchemas.importDataToRedisSchema.parse(input);
  if (input.jsFunctionString) {
    let disableFlags = DISABLE_JS_FLAGS;
    //disableFlags.NAMES_CONSOLE = false; // allow console.log
    validateJS(input.jsFunctionString, disableFlags);
  }

  // Connect to Redis ----------------------
  let redisConUrl = getInputRedisConUrl(
    input.redisConUrl,
    input.redisConUrlEncrypted
  );
  const redisWrapper = new RedisWrapper(redisConUrl);
  await redisWrapper.connect();

  // ----------------------
  let startTimeInMs = 0;

  let importInitState = getInitialImportState(input);
  let importState = importInitState as IImportArrayFileState;

  startTimeInMs = performance.now();
  emitSocketMessages({
    socketClient: importState.socketClient,
    currentStatus: importState.currentStatus,
  });

  if (input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE) {
    importState.fileContents = await readRawJSONFile(input.uploadPath, true);
  } else if (input.uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE) {
    importState.fileContents = await readRawCSVFile(input.uploadPath);
  }

  let startIndex = 0;
  await loopJsonArrayFileContents(
    importState.fileContents,
    input.isStopOnError,
    startIndex,
    importState,
    async (data) => {
      await readEachFileCallback(data, redisWrapper, input, importState);
    }
  );

  setImportTimeAndStatus(startTimeInMs, importState);
  await redisWrapper.disconnect();

  return {
    stats: importState.stats,
    importErrors: importState.importErrors,
    currentStatus: importState.currentStatus,
  };
};

export { importArrayFileToRedis };
