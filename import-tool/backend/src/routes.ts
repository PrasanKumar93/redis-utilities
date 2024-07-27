import express, { Request, Response } from "express";

import CONSTANTS from "./utils/constants";
import { testRedisConnection, importFilesToRedis } from "./service-impl";

const router = express.Router();

router.post("/testRedisConnection", async (req: Request, res: Response) => {
  const result: any = {
    data: null,
    error: null,
  };
  const { redisConUrl } = req.body;

  try {
    result.data = await testRedisConnection({
      redisConUrl,
    });
  } catch (err) {
    console.error("/testRedisConnection API failed !", err);
    result.error = err;
    res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

router.post("/importFilesToRedis", async (req: Request, res: Response) => {
  const result: any = {
    data: null,
    error: null,
  };
  const { redisConUrl, serverFolderPath, socketId } = req.body;

  try {
    result.data = await importFilesToRedis({
      redisConUrl,
      serverFolderPath,
      socketId,
    });
  } catch (err) {
    console.error("/importFilesToRedis API failed !", err);
    result.error = err;
    res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

export { router };
