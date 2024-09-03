import { z } from "zod";

const zodEncryptedData = z.object({
  encryptedData: z.string(),
  iv: z.string(),
  authTag: z.string(),
});

export const testRedisConnectionSchema = z.object({
  redisConUrl: z.string().optional(), // one of the two fields is required
  redisConUrlEncrypted: zodEncryptedData.optional(),
});

export const importFilesToRedisSchema = z.object({
  redisConUrl: z.string().optional(),
  redisConUrlEncrypted: zodEncryptedData.optional(),

  socketId: z.string().optional(),
  idField: z.string().optional(),
  keyPrefix: z.string().optional(),
  isStopOnError: z.boolean().optional(),
  jsFunctionString: z.string().optional(),

  // one of the below fields is required
  serverFolderPath: z.string().optional(),
  serverArrayFilePath: z.string().optional(),
});

export const resumeImportFilesToRedisSchema = z.object({
  socketId: z.string(),
  isStopOnError: z.boolean().optional(),
});

export const testJSONFormatterFnSchema = z.object({
  jsFunctionString: z.string(),
  paramsObj: z.record(z.string(), z.any()),
});

export const getSampleInputForJSONFormatterFnSchema = z.object({
  uploadType: z.string().optional(),
  uploadPath: z.string(),
});

//--- types ---

interface IImportStats {
  totalFiles: number;
  processed: number;
  failed: number;
  totalTimeInMs: number;
}

export type { IImportStats };
