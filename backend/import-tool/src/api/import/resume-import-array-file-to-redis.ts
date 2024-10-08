import type {
  IImportArrayFileState,
  IImportStreamFileState,
} from "../../state.js";

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
import { loopJsonArrayFileContents } from "../../utils/file-reader.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "../../utils/constants.js";
import { readFileAsStream } from "../../utils/file-stream-reader.js";

const resumeImportArrayFileToRedis = async (
  resumeInput: z.infer<typeof InputSchemas.resumeImportDataToRedisSchema>
) => {
  InputSchemas.resumeImportDataToRedisSchema.parse(resumeInput); // validate input

  let { importResState, fileIndex } = getResumeImportState(resumeInput);
  let importState = importResState as IImportStreamFileState;

  if (fileIndex >= 0 && importState.input) {
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

    if (input.uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE) {
      const importStateArrayFile = importState as IImportArrayFileState;

      await loopJsonArrayFileContents(
        importStateArrayFile.fileContents,
        fileIndex,
        importStateArrayFile,
        async (data) => {
          await readEachFileCallback(
            data,
            redisWrapper,
            input,
            importStateArrayFile
          );
        }
      );
    } else if (input.uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE) {
      await readFileAsStream(
        "",
        input.uploadType,
        fileIndex,
        importState,
        async (data) => {
          await readEachFileCallback(data, redisWrapper, input, importState);
        }
      );
    }

    setImportTimeAndStatus(startTimeInMs, importState);
    await redisWrapper.disconnect();
  }

  return {
    stats: importState.stats,
    importErrors: importState.importErrors,
    currentStatus: importState.currentStatus,
  };
};
export { resumeImportArrayFileToRedis };
