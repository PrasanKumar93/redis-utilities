import type { IFileReaderData } from "../../utils/file-reader.js";
import type { IImportStats } from "../../input-schema.js";
import type { IImportFilesState, IImportCommonState } from "../../state.js";

import path from "node:path";
import _ from "lodash";
import { z } from "zod";
import { Socket } from "socket.io";

import { socketState, ImportStatus } from "../../state.js";

import * as InputSchemas from "../../input-schema.js";
import { RedisWrapper } from "../../utils/redis.js";
import { LoggerCls } from "../../utils/logger.js";
import { runJSFunction } from "../../utils/validate-js.js";

const getFileKey = (
  filePath: string,
  idField: string = "",
  content: any,
  keyPrefix: string = "",
  index: number = 0
) => {
  let key = "";
  if (idField && content) {
    // JSON id field as key
    //key = content[idField];
    key = _.get(content, idField); // to support nested id with dot
  } else if (filePath) {
    // filename as key
    if (filePath.endsWith(".json.gz")) {
      key = path.basename(filePath, ".json.gz");
    } else if (filePath.endsWith(".json")) {
      key = path.basename(filePath, ".json");
    } else {
      key = path.basename(filePath);
    }
  } else if (index >= 0) {
    key = (index + 1).toString();
  }

  key = keyPrefix ? keyPrefix + key : key;

  return key;
};

const updateStatsAndErrors = (
  data: IFileReaderData,
  storeStats?: IImportStats,
  storeFileErrors?: any[]
) => {
  if (data && storeStats && storeFileErrors) {
    storeStats.totalFiles = data.totalFiles;
    if (data.error) {
      storeStats.failed++;

      const fileError = {
        filePath: data.filePath,
        error: data.error,
        fileIndex: data.fileIndex,
      };
      storeFileErrors.push(fileError);
    } else {
      storeStats.processed++;
    }
  }
};

const processFileData = async (
  data: IFileReaderData,
  redisWrapper: RedisWrapper,
  input: z.infer<typeof InputSchemas.importFilesToRedisSchema>
) => {
  if (data?.content) {
    let key = getFileKey(
      data.filePath,
      input.idField,
      data.content,
      input.keyPrefix,
      data.fileIndex
    );

    const isKeyExists = await redisWrapper.client?.exists(key);
    await redisWrapper.client?.json.set(key, ".", data.content);
    if (isKeyExists) {
      LoggerCls.info(`Updated key: ${key}`);
    } else {
      LoggerCls.log(`Added key: ${key}`);
    }
  }
};

const formatJSONContent = async (
  data: IFileReaderData,
  importState: IImportFilesState
) => {
  if (importState.input?.jsFunctionString && data?.content) {
    const jsFunctionString = importState.input.jsFunctionString;

    const modifiedContent = await runJSFunction(
      jsFunctionString,
      data.content,
      true,
      null
    );
    if (modifiedContent) {
      data.content = modifiedContent;
    }
  }
};

const emitSocketMessages = (info: {
  socketClient?: Socket | null;
  stats?: IImportStats;
  data?: IFileReaderData;
  currentStatus?: ImportStatus;
}) => {
  if (info?.socketClient) {
    if (info.stats) {
      info.socketClient.emit("importStats", info.stats);
    }

    if (info.data?.error) {
      const fileError = {
        filePath: info.data?.filePath || "",
        error: info.data.error,
        fileIndex: info.data.fileIndex,
      };
      info.socketClient.emit("importFileError", fileError);
    }

    if (info.currentStatus) {
      info.socketClient.emit("importStatus", info.currentStatus);
    }
  }
};

const readEachFileCallback = async (
  data: IFileReaderData,
  redisWrapper: RedisWrapper,
  input: z.infer<typeof InputSchemas.importFilesToRedisSchema>,
  importState: IImportFilesState
) => {
  await formatJSONContent(data, importState);

  await processFileData(data, redisWrapper, input);

  updateStatsAndErrors(data, importState.stats, importState.importErrors);
  emitSocketMessages({
    socketClient: importState.socketClient,
    stats: importState.stats,
    data,
  });
  importState.fileIndex = data.fileIndex;

  if (data?.error && input.isStopOnError) {
    importState.currentStatus = ImportStatus.ERROR_STOPPED;
  } else if (importState.isPaused) {
    importState.currentStatus = ImportStatus.PAUSED;
  }
};

const setImportTimeAndStatus = (
  startTimeInMs: number,
  importState: IImportFilesState
) => {
  if (importState?.stats) {
    const endTimeInMs = performance.now();
    importState.stats.totalTimeInMs = Math.round(endTimeInMs - startTimeInMs);
    LoggerCls.info(`Time taken: ${importState.stats.totalTimeInMs} ms`);

    if (importState.currentStatus == ImportStatus.IN_PROGRESS) {
      const failed = importState.stats.failed;
      const processed = importState.stats.processed;
      const totalFiles = importState.stats.totalFiles;
      if (processed == totalFiles) {
        importState.currentStatus = ImportStatus.SUCCESS;
      } else {
        importState.currentStatus = ImportStatus.PARTIAL_SUCCESS;
      }
    }

    emitSocketMessages({
      socketClient: importState.socketClient,
      stats: importState.stats,
      currentStatus: importState.currentStatus,
    });
  }
};

const getInitialImportState = (
  input: z.infer<typeof InputSchemas.importFilesToRedisSchema>
) => {
  let importState: IImportCommonState = {};
  if (input?.socketId) {
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
  importState.importErrors = [];
  importState.fileIndex = 0;

  importState.isPaused = false;
  importState.currentStatus = ImportStatus.IN_PROGRESS;

  return importState;
};

const getResumeImportState = (
  resumeInput: z.infer<typeof InputSchemas.importFilesToRedisSchema>
) => {
  let importResState: IImportCommonState = {};
  let fileIndex = 0;

  if (resumeInput?.socketId && socketState[resumeInput.socketId]) {
    importResState = socketState[resumeInput.socketId];

    if (importResState.currentStatus == ImportStatus.IN_PROGRESS) {
      throw new Error("Import is already in progress for this socketId");
    }

    if (importResState.input) {
      importResState.input.isStopOnError = resumeInput.isStopOnError;

      //if error occurred, resume from last file
      fileIndex = importResState.fileIndex || 0;
      if (importResState.currentStatus == ImportStatus.PAUSED) {
        // if paused, resume from next file
        fileIndex++;
      }

      importResState.isPaused = false;
      importResState.currentStatus = ImportStatus.IN_PROGRESS;
    }
  }

  return { importResState, fileIndex };
};

export {
  readEachFileCallback,
  emitSocketMessages,
  setImportTimeAndStatus,
  getInitialImportState,
  getResumeImportState,
};
