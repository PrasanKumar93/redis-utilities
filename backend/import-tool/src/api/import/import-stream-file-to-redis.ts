import type { IImportStreamFileState } from "../../state.js";

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
  readFileAsStream,
  getFileTotalEntriesCount,
} from "../../utils/file-stream-reader.js";
import { LoggerCls } from "../../utils/logger.js";

const importStreamFileToRedis = async (
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
  let importState = importInitState as IImportStreamFileState;

  startTimeInMs = performance.now();
  emitSocketMessages({
    socketClient: importState.socketClient,
    currentStatus: importState.currentStatus,
  });

  let startIndex = 0;
  if (
    input.uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE ||
    input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE
  ) {
    /*
    getFileTotalEntriesCount(input.uploadPath, input.uploadType, (count) => {
      if (importState.stats) {
        importState.stats.totalFiles = count;

        emitSocketMessages({
          socketClient: importState.socketClient,
          stats: importState.stats,
        });
      }
    }); //async
     */

    const msg = await readFileAsStream(
      input.uploadPath,
      input.uploadType,
      startIndex,
      importState,
      async (data) => {
        await readEachFileCallback(data, redisWrapper, input, importState);
      }
    );
    LoggerCls.info(msg);
  }

  setImportTimeAndStatus(startTimeInMs, importState);
  await redisWrapper.disconnect();

  return {
    stats: importState.stats,
    importErrors: importState.importErrors,
    currentStatus: importState.currentStatus,
  };
};

export { importStreamFileToRedis };
