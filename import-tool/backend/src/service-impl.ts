import type { IFileReaderData } from "./utils/file-reader";

import path from "path";
import { z } from "zod";
import _ from "lodash";

import { RedisWrapper } from "./utils/redis";
import { readFiles } from "./utils/file-reader";
import * as InputSchemas from "./input-schema";
import { socketClients } from "./state";

interface IImportStats {
  totalFiles: number;
  processed: number;
  failed: number;
  startTimeInMs: number;
  endTimeInMs: number;
  totalTimeInMs: number;
}

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
  stats: IImportStats,
  fileErrors: any[]
) => {
  if (data) {
    stats.totalFiles = data.totalFiles;
    if (data.error) {
      stats.failed++;

      const fileError = {
        filePath: data.filePath,
        error: data.error,
      };
      fileErrors.push(fileError);
    } else {
      stats.processed++;
    }
  }
};
const emitSocketMessages = (
  socketClient: any,
  stats: IImportStats,
  data: IFileReaderData | null
) => {
  if (socketClient) {
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
    data.content = JSON.parse(data.content);

    let key = getFileKey(
      data.filePath,
      input.idField,
      data.content,
      input.keyPrefix
    );
    await redisWrapper.client?.json.set(key, ".", data.content);
    console.log(`Added file: ${data.filePath}`);
  }
};

const importFilesToRedis = async (
  input: z.infer<typeof InputSchemas.importFilesToRedisSchema>
) => {
  InputSchemas.importFilesToRedisSchema.parse(input); // validate input

  let socketClient = input.socketId ? socketClients[input.socketId] : null;
  const stats: IImportStats = {
    totalFiles: 0,
    processed: 0,
    failed: 0,
    startTimeInMs: 0,
    endTimeInMs: 0,
    totalTimeInMs: 0,
  };
  const fileErrors: any[] = [];

  const redisWrapper = new RedisWrapper(input.redisConUrl);
  await redisWrapper.connect();

  const jsonGlob = getJSONGlob(input.serverFolderPath);

  stats.startTimeInMs = performance.now();

  let allFilesPromObj: any = readFiles([jsonGlob], [], async (data) => {
    await processFileData(data, redisWrapper, input);
    updateStatsAndErrors(data, stats, fileErrors);
    emitSocketMessages(socketClient, stats, data);
  });

  allFilesPromObj = allFilesPromObj.then(() => {
    stats.endTimeInMs = performance.now();
    stats.totalTimeInMs = Math.round(stats.endTimeInMs - stats.startTimeInMs);
    console.log(`Time taken: ${stats.totalTimeInMs} ms`);

    emitSocketMessages(socketClient, stats, null);

    return redisWrapper.disconnect();
  });

  if (socketClient) {
    // if input.socketId exists, individual file stats/ error will be updated through socket messages
    return {
      message: "Importing files to Redis started !",
    };
  } else {
    // For regular API call, return the final stats and errors
    await allFilesPromObj;
    return { stats, fileErrors };
  }
};

//#endregion

export { testRedisConnection, importFilesToRedis };
