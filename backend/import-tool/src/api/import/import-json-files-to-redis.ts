import type { IImportFilesState } from "../../state.js";

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
import { DISABLE_JS_FLAGS } from "../../utils/constants.js";
import {
  getFilePathsFromGlobPattern,
  readJsonFilesFromPaths,
  getJsonGlobForFolderPath,
} from "../../utils/file-reader.js";

const importJSONFilesToRedis = async (
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
  let importState = importInitState as IImportFilesState;
  console.log("importState.socketClient", importState.socketClient);

  const jsonGlobArr = getJsonGlobForFolderPath(input.uploadPath);

  startTimeInMs = performance.now();
  emitSocketMessages({
    socketClient: importState.socketClient,
    currentStatus: importState.currentStatus,
  });

  importState.filePaths = await getFilePathsFromGlobPattern(jsonGlobArr, []);

  let startIndex = 0;
  await readJsonFilesFromPaths(
    importState.filePaths,
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

export { importJSONFilesToRedis };
