import { z } from "zod";

import { postRequest, consoleLogError, errorAPIAlert } from "./axios-util";
import { errorToast } from "./toast-util";

//#region API input schema
const zodEncryptedData = z.object({
  encryptedData: z.string(),
  iv: z.string(),
  authTag: z.string(),
});

const testRedisConnectionSchema = z.object({
  redisConUrlEncrypted: zodEncryptedData,
});

const importDataToRedisSchema = z.object({
  redisConUrlEncrypted: zodEncryptedData,
  socketId: z.string().optional(),
  idField: z.string().optional(),
  keyPrefix: z.string().optional(),
  isStopOnError: z.boolean().optional(),
  jsFunctionString: z.string().optional(),

  uploadType: z.string().optional(),
  uploadPath: z.string(),
});

const resumeImportDataToRedisSchema = z.object({
  socketId: z.string(),
  isStopOnError: z.boolean().optional(),
  uploadType: z.string().optional(),
  uploadPath: z.string(),
});

export const testJSONFormatterFnSchema = z.object({
  idField: z.string().optional(),
  keyPrefix: z.string().optional(),

  jsFunctionString: z.string(),
  paramsObj: z.record(z.string(), z.any()),
});

const getSampleInputForJSONFormatterFnSchema = z.object({
  uploadType: z.string().optional(),
  uploadPath: z.string(),
});

//#endregion

const API_PATHS = {
  testRedisConnection: "/testRedisConnection",
  importDataToRedis: "/importDataToRedis",
  resumeImportDataToRedis: "/resumeImportDataToRedis",
  testJSONFormatterFn: "/testJSONFormatterFn",
  getSampleInputForJSONFormatterFn: "/getSampleInputForJSONFormatterFn",

  uploadFileForImportDataToRedis: "/uploadFileForImportDataToRedis", //used directly in app/import/page.tsx
};

//#region API calls
const testRedisConnection = async (
  input: z.infer<typeof testRedisConnectionSchema>
) => {
  try {
    testRedisConnectionSchema.parse(input); // validate input

    const response = await postRequest(API_PATHS.testRedisConnection, input);
    return response?.data;
  } catch (axiosError: any) {
    consoleLogError(axiosError);
    errorAPIAlert(API_PATHS.testRedisConnection);
  }
};

const importDataToRedis = async (
  input: z.infer<typeof importDataToRedisSchema>
) => {
  try {
    importDataToRedisSchema.parse(input); // validate input
    const response = await postRequest(API_PATHS.importDataToRedis, input);
    return response?.data;
  } catch (axiosError: any) {
    consoleLogError(axiosError);
    errorAPIAlert(API_PATHS.importDataToRedis);
  }
};

const resumeImportDataToRedis = async (
  input: z.infer<typeof resumeImportDataToRedisSchema>
) => {
  try {
    resumeImportDataToRedisSchema.parse(input); // validate input
    const response = await postRequest(
      API_PATHS.resumeImportDataToRedis,
      input
    );
    return response?.data;
  } catch (axiosError: any) {
    consoleLogError(axiosError);
    errorAPIAlert(API_PATHS.resumeImportDataToRedis);
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
    const response = await postRequest(API_PATHS.testJSONFormatterFn, input);
    testResult.data = response?.data?.data;
  } catch (axisError: any) {
    const error = consoleLogError(axisError);
    if (error?.userMessage) {
      errorToast(error.userMessage);
    } else {
      errorAPIAlert(API_PATHS.testJSONFormatterFn);
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
      API_PATHS.getSampleInputForJSONFormatterFn,
      input
    );
    return response?.data;
  } catch (axiosError: any) {
    consoleLogError(axiosError);
    errorAPIAlert(API_PATHS.getSampleInputForJSONFormatterFn);
  }
};

//#endregion

export {
  API_PATHS,
  testRedisConnection,
  importDataToRedis,
  resumeImportDataToRedis,
  testJSONFormatterFn,
  getSampleInputForJSONFormatterFn,
};
