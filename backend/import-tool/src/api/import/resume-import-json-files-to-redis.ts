import type { IImportFilesState } from "../../state.js";

import _ from "lodash";
import { z } from "zod";

import {
  readEachFileCallback,
  emitSocketMessages,
  setImportTimeAndStatus,
  getResumeImportState,
} from "./common-import.js";
import { getInputRedisConUrl } from "../common-api.js";

import * as InputSchemas from "../../input-schema.js";
import { RedisWrapper } from "../../utils/redis.js";
import { readJsonFilesFromPaths } from "../../utils/file-reader.js";

const resumeImportJSONFilesToRedis = async (
  resumeInput: z.infer<typeof InputSchemas.resumeImportDataToRedisSchema>
) => {
  InputSchemas.resumeImportDataToRedisSchema.parse(resumeInput); // validate input

  let { importResState, fileIndex } = getResumeImportState(resumeInput);
  let importState = importResState as IImportFilesState;

  if (importState?.filePaths?.length && fileIndex >= 0 && importState.input) {
    let input = importState.input;

    let redisConUrl = getInputRedisConUrl(
      input.redisConUrl,
      input.redisConUrlEncrypted
    );
    const redisWrapper = new RedisWrapper(redisConUrl);
    await redisWrapper.connect();

    let startTimeInMs = performance.now();
    emitSocketMessages({
      socketClient: importState.socketClient,
      currentStatus: importState.currentStatus,
    });

    await readJsonFilesFromPaths(
      importState.filePaths,
      input.isStopOnError,
      fileIndex,
      importState,
      async (data) => {
        await readEachFileCallback(data, redisWrapper, input, importState);
      }
    );

    setImportTimeAndStatus(startTimeInMs, importState);
    await redisWrapper.disconnect();
  }

  return {
    stats: importState.stats,
    importErrors: importState.importErrors,
    currentStatus: importState.currentStatus,
  };
};

export { resumeImportJSONFilesToRedis };
