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
import { readJsonFilesFromPaths } from "../../utils/file-reader.js";

const resumeImportJSONFilesToRedis = async (
  resumeInput: z.infer<typeof InputSchemas.resumeImportFilesToRedisSchema>
) => {
  InputSchemas.resumeImportFilesToRedisSchema.parse(resumeInput); // validate input

  let startTimeInMs = 0;
  let importState: IImportFilesState = {};

  if (resumeInput.socketId && socketState[resumeInput.socketId]) {
    importState = socketState[resumeInput.socketId];

    if (importState.currentStatus == ImportStatus.IN_PROGRESS) {
      throw new Error("Import is already in progress for this socketId");
    }

    if (importState.input && importState.filePaths?.length) {
      importState.input.isStopOnError = resumeInput.isStopOnError;

      //if error occurred, resume from last file
      let filePathIndex = importState.filePathIndex || 0;
      if (importState.currentStatus == ImportStatus.PAUSED) {
        // if paused, resume from next file
        filePathIndex++;
      }

      let input = importState.input;

      let redisConUrl = getInputRedisConUrl(
        input.redisConUrl,
        input.redisConUrlEncrypted
      );
      const redisWrapper = new RedisWrapper(redisConUrl);
      await redisWrapper.connect();

      startTimeInMs = performance.now();
      importState.isPaused = false;
      importState.currentStatus = ImportStatus.IN_PROGRESS;
      emitSocketMessages({
        socketClient: importState.socketClient,
        currentStatus: importState.currentStatus,
      });

      await readJsonFilesFromPaths(
        importState.filePaths,
        input.isStopOnError,
        filePathIndex,
        importState,
        async (data) => {
          await readEachFileCallback(data, redisWrapper, input, importState);
        }
      );

      setImportTimeAndStatus(startTimeInMs, importState);
      await redisWrapper.disconnect();
    }
  }

  return {
    stats: importState.stats,
    fileErrors: importState.fileErrors,
    currentStatus: importState.currentStatus,
  };
};

export { resumeImportJSONFilesToRedis };
