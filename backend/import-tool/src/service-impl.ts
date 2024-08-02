import type { IFileReaderData } from "./utils/file-reader.js";
import type { IImportStats } from "./input-schema.js";
import type { IImportFilesState } from "./state.js";

import path from "path";
import { z } from "zod";
import _ from "lodash";
import { Socket } from "socket.io";

import { RedisWrapper } from "./utils/redis.js";
import { readFiles } from "./utils/file-reader.js";
import { LoggerCls } from "./utils/logger.js";

import * as InputSchemas from "./input-schema.js";
import { socketState } from "./state.js";

const testRedisConnection = async (
  input: z.infer<typeof InputSchemas.testRedisConnectionSchema>
) => {
  InputSchemas.testRedisConnectionSchema.parse(input); // validate input

  const redisWrapper = new RedisWrapper(input.redisConUrl);

  await redisWrapper.connect();
  await redisWrapper.client?.ping();
  await redisWrapper.disconnect();

  return "Connection to Redis successful !";
};

//#region importFilesToRedis

const getJSONGlob = (serverFolderPath: string) => {
  if (serverFolderPath.match(/\\/)) {
    //windows OS path
    serverFolderPath = serverFolderPath.replace(/\\/g, "/");
  }
  if (!serverFolderPath.endsWith("/")) {
    serverFolderPath += "/";
  }
  let jsonGlob = serverFolderPath + "**/*.json";
  return jsonGlob;
};

const getFileKey = (
  filePath: string,
  idField: string = "",
  content: any,
  keyPrefix: string = ""
) => {
  let key = "";
  if (idField && content) {
    // JSON id field as key
    //key = content[idField];
    key = _.get(content, idField); // to support nested id with dot
  } else {
    key = path.basename(filePath, ".json"); // filename as key (default)
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
      };
      storeFileErrors.push(fileError);
    } else {
      storeStats.processed++;
    }
  }
};
const emitSocketMessages = (
  socketClient?: Socket,
  stats?: IImportStats,
  data?: IFileReaderData
) => {
  if (socketClient && stats) {
    socketClient.emit("importStats", stats);

    if (data?.error) {
      const fileError = {
        filePath: data.filePath,
        error: data.error,
      };
      socketClient.emit("importFileError", fileError);
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
      input.keyPrefix
    );

    const isKeyExists = await redisWrapper.client?.exists(key);
    await redisWrapper.client?.json.set(key, ".", data.content);
    if (isKeyExists) {
      LoggerCls.info(`Updated file: ${data.filePath}`);
    } else {
      LoggerCls.log(`Added file: ${data.filePath}`);
    }
  }
};

const calcImportFilesTime = (
  startTimeInMs: number,
  importState: IImportFilesState
) => {
  if (importState?.stats) {
    const endTimeInMs = performance.now();
    importState.stats.totalTimeInMs = Math.round(endTimeInMs - startTimeInMs);
    LoggerCls.info(`Time taken: ${importState.stats.totalTimeInMs} ms`);
    emitSocketMessages(importState.socketClient, importState.stats);
  }
};

const readEachFileCallback = async (
  data: IFileReaderData,
  redisWrapper: RedisWrapper,
  input: z.infer<typeof InputSchemas.importFilesToRedisSchema>,
  importState: IImportFilesState
) => {
  await processFileData(data, redisWrapper, input);
  updateStatsAndErrors(data, importState.stats, importState.fileErrors);
  emitSocketMessages(importState.socketClient, importState.stats, data);
  importState.filePathIndex = data.filePathIndex;
};

const importFilesToRedis = async (
  input: z.infer<typeof InputSchemas.importFilesToRedisSchema>
) => {
  InputSchemas.importFilesToRedisSchema.parse(input); // validate input

  let startTimeInMs = 0;
  let importState: IImportFilesState = {};

  if (input.socketId && socketState[input.socketId]) {
    importState = socketState[input.socketId];
  }
  importState.stats = {
    totalFiles: 0,
    processed: 0,
    failed: 0,
    totalTimeInMs: 0,
  };
  importState.fileErrors = [];
  importState.filePaths = [];
  importState.filePathIndex = 0;

  const redisWrapper = new RedisWrapper(input.redisConUrl);
  await redisWrapper.connect();

  const jsonGlob = getJSONGlob(input.serverFolderPath);

  startTimeInMs = performance.now();

  let allFilesPromObj: any = readFiles(
    [jsonGlob],
    [],
    input.isStopOnError,
    importState.filePaths,
    async (data) => {
      await readEachFileCallback(data, redisWrapper, input, importState);
    }
  );

  allFilesPromObj = allFilesPromObj.then(() => {
    calcImportFilesTime(startTimeInMs, importState);
    return redisWrapper.disconnect();
  });

  await allFilesPromObj;
  return {
    stats: importState.stats,
    fileErrors: importState.fileErrors,
  };
};

//#endregion

export { testRedisConnection, importFilesToRedis };
