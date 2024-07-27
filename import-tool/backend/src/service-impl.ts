import path from "path";
import { z } from "zod";

import { RedisWrapper } from "./utils/redis";
import { readFiles } from "./utils/file-reader";
import * as InputSchemas from "./input-schema";
import { socketClients } from "./state";

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
  content: string,
  keyPrefix: string = ""
) => {
  let key = "";
  if (idField && content) {
    const parsedContent = JSON.parse(content);
    key = parsedContent[idField]; // JSON id field as key
  } else {
    key = path.basename(filePath, ".json"); // filename as key (default)
  }

  key += keyPrefix ?? "";

  return key;
};

const importFilesToRedis = async (
  input: z.infer<typeof InputSchemas.importFilesToRedisSchema>
) => {
  InputSchemas.importFilesToRedisSchema.parse(input); // validate input

  const stats = {
    totalFiles: 0,
    processed: 0,
    failed: 0,
  };
  const redisWrapper = new RedisWrapper(input.redisConUrl);
  await redisWrapper.connect();

  const jsonGlob = getJSONGlob(input.serverFolderPath);

  //async call
  let allFilesPromObj = readFiles(
    [jsonGlob],
    [],
    async ({ filePath, content, totalFiles, error }) => {
      stats.totalFiles = totalFiles;

      if (error) {
        stats.failed++;
      } else {
        let key = getFileKey(filePath, input.idField, content, input.keyPrefix);
        await redisWrapper.client?.json.set(key, ".", content);
        stats.processed++;
        console.log(`Added file: ${filePath}`);
      }

      if (input.socketId) {
        const socketClient = socketClients[input.socketId];
        socketClient?.emit("importStats", stats);
      }
    }
  );

  allFilesPromObj = allFilesPromObj.then(() => {
    return redisWrapper.disconnect();
  });

  return "Importing files to Redis started !";
};

//#endregion

export { testRedisConnection, importFilesToRedis };
