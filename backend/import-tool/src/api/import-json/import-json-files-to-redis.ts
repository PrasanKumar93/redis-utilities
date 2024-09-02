import type { IImportFilesState } from "../../state.js";

import _ from "lodash";
import { z } from "zod";

import {
  readEachFileCallback,
  emitSocketMessages,
  setImportTimeAndStatus,
} from "./common-import-json.js";
import { getInputRedisConUrl } from "../common-api.js";

import { socketState, ImportStatus } from "../../state.js";
import * as InputSchemas from "../../input-schema.js";
import { RedisWrapper } from "../../utils/redis.js";
import { validateJS } from "../../utils/validate-js.js";
import { DISABLE_JS_FLAGS } from "../../utils/constants.js";
import {
  getFilePathsFromGlobPattern,
  readJsonFilesFromPaths,
  getJSONGlobForFolderPath,
} from "../../utils/file-reader.js";

const importJSONFilesToRedis = async (
  input: z.infer<typeof InputSchemas.importFilesToRedisSchema>
) => {
  InputSchemas.importFilesToRedisSchema.parse(input); // validate input

  if (input.jsFunctionString) {
    let disableFlags = DISABLE_JS_FLAGS;
    //disableFlags.NAMES_CONSOLE = false; // allow console.log
    validateJS(input.jsFunctionString, disableFlags);
  }

  let startTimeInMs = 0;
  let importState: IImportFilesState = {};

  if (input.socketId) {
    if (!socketState[input.socketId]) {
      socketState[input.socketId] = {};
    }
    importState = socketState[input.socketId];
  }

  importState.input = input;
  importState.stats = {
    totalFiles: 0,
    processed: 0,
    failed: 0,
    totalTimeInMs: 0,
  };
  importState.fileErrors = [];
  importState.filePaths = [];
  importState.filePathIndex = 0;

  let redisConUrl = getInputRedisConUrl(
    input.redisConUrl,
    input.redisConUrlEncrypted
  );
  const redisWrapper = new RedisWrapper(redisConUrl);
  await redisWrapper.connect();

  const jsonGlobArr = getJSONGlobForFolderPath(input.serverFolderPath);

  startTimeInMs = performance.now();
  importState.isPaused = false;
  importState.currentStatus = ImportStatus.IN_PROGRESS;
  emitSocketMessages({
    socketClient: importState.socketClient,
    currentStatus: importState.currentStatus,
  });

  importState.filePaths = await getFilePathsFromGlobPattern(jsonGlobArr, []);

  let startIndex = 0;
  await readJsonFilesFromPaths(
    importState.filePaths,
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
    fileErrors: importState.fileErrors,
    currentStatus: importState.currentStatus,
  };
};

export { importJSONFilesToRedis };
