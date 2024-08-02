import { z } from "zod";

export const testRedisConnectionSchema = z.object({
  redisConUrl: z.string(),
});

export const importFilesToRedisSchema = z.object({
  redisConUrl: z.string(),
  serverFolderPath: z.string(),
  socketId: z.string().optional(),
  idField: z.string().optional(),
  keyPrefix: z.string().optional(),
  isStopOnError: z.boolean().optional(),
});

//--- types ---

interface IImportStats {
  totalFiles: number;
  processed: number;
  failed: number;
  totalTimeInMs: number;
}

export type { IImportStats };
