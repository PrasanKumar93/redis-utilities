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
});
