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

export const testJSONFormatterFnSchema = z.object({
  jsFunctionString: z.string(),
  paramsObj: z.record(z.string(), z.any()),
});

const getSampleInputForJSONFormatterFnSchema = z.object({
  serverFolderPath: z.string(),
});

//#endregion

// #region helper functions
const consoleLogError = (axiosError: any) => {
  const error = axiosError?.response?.data?.error || axiosError;
  if (error) {
    console.error(error);
  }
  return error;
};
// #endregion

//#region API calls
const testRedisConnection = async (
  input: z.infer<typeof testRedisConnectionSchema>
) => {
  try {
    testRedisConnectionSchema.parse(input); // validate input
    const response = await postRequest("/testRedisConnection", input);
    return response?.data;
  } catch (axiosError: any) {
    consoleLogError(axiosError);
    errorToast("Error in /testRedisConnection API");
  }
};

const importFilesToRedis = async (
  input: z.infer<typeof importFilesToRedisSchema>
) => {
  try {
    importFilesToRedisSchema.parse(input); // validate input
    const response = await postRequest("/importFilesToRedis", input);
    return response?.data;
  } catch (axiosError: any) {
    consoleLogError(axiosError);
    errorToast("Error in /importFilesToRedis API");
  }
};

const resumeImportFilesToRedis = async (
  input: z.infer<typeof resumeImportFilesToRedisSchema>
) => {
  try {
    resumeImportFilesToRedisSchema.parse(input); // validate input
    const response = await postRequest("/resumeImportFilesToRedis", input);
    return response?.data;
  } catch (axiosError: any) {
    consoleLogError(axiosError);
    errorToast("Error in /resumeImportFilesToRedis API");
  }
};

const testJSONFormatterFn = async (
  input: z.infer<typeof testJSONFormatterFnSchema>
) => {
  const testResult: any = {
    data: null,
    error: null,
  };
  try {
    testJSONFormatterFnSchema.parse(input); // validate input
    const response = await postRequest("/testJSONFormatterFn", input);
    testResult.data = response?.data?.data;
  } catch (axisError: any) {
    const error = consoleLogError(axisError);
    if (error?.userMessage) {
      errorToast(error.userMessage);
    } else {
      errorToast("Error in /testJSONFormatterFn API");
    }
    testResult.error = error?.message || error; // message, stack
  }

  return testResult;
};

const getSampleInputForJSONFormatterFn = async (
  input: z.infer<typeof getSampleInputForJSONFormatterFnSchema>
) => {
  try {
    getSampleInputForJSONFormatterFnSchema.parse(input); // validate input

    const response = await postRequest(
      "/getSampleInputForJSONFormatterFn",
      input
    );
    return response?.data;
  } catch (axiosError: any) {
    consoleLogError(axiosError);
    errorToast("Error in /getSampleInputForJSONFormatterFn API");
  }
};

//#endregion

export {
  testRedisConnection,
  importFilesToRedis,
  resumeImportFilesToRedis,
  testJSONFormatterFn,
  getSampleInputForJSONFormatterFn,
};
