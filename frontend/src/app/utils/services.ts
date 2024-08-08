import { z } from "zod";

import { postRequest } from "./axios-util";

import { errorToast } from "./toast-util";

//#region API input schema
const testRedisConnectionSchema = z.object({
  redisConUrl: z.string(),
});

const importFilesToRedisSchema = z.object({
  redisConUrl: z.string(),
  serverFolderPath: z.string(),
  socketId: z.string().optional(),
  idField: z.string().optional(),
  keyPrefix: z.string().optional(),
  isStopOnError: z.boolean().optional(),
});

const resumeImportFilesToRedisSchema = z.object({
  socketId: z.string(),
  isStopOnError: z.boolean().optional(),
});

//#endregion

//#region API calls
const testRedisConnection = async (
  input: z.infer<typeof testRedisConnectionSchema>
) => {
  try {
    testRedisConnectionSchema.parse(input); // validate input
    const response = await postRequest("/testRedisConnection", input);
    return response?.data;
  } catch (error) {
    errorToast("Error in /testRedisConnection API");
    console.error(error);
  }
};

const importFilesToRedis = async (
  input: z.infer<typeof importFilesToRedisSchema>
) => {
  try {
    importFilesToRedisSchema.parse(input); // validate input
    const response = await postRequest("/importFilesToRedis", input);
    return response?.data;
  } catch (error) {
    errorToast("Error in /importFilesToRedis API");
    console.error(error);
  }
};

const resumeImportFilesToRedis = async (
  input: z.infer<typeof resumeImportFilesToRedisSchema>
) => {
  try {
    resumeImportFilesToRedisSchema.parse(input); // validate input
    const response = await postRequest("/resumeImportFilesToRedis", input);
    return response?.data;
  } catch (error) {
    errorToast("Error in /resumeImportFilesToRedis API");
    console.error(error);
  }
};
//#endregion

export { testRedisConnection, importFilesToRedis, resumeImportFilesToRedis };
