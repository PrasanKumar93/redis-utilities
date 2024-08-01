import express, { Request, Response } from "express";

import { CONSTANTS } from "./utils/constants.js";
import { testRedisConnection, importFilesToRedis } from "./service-impl.js";
import { LoggerCls } from "./utils/logger.js";

const router = express.Router();

router.post("/testRedisConnection", async (req: Request, res: Response) => {
  const result: any = {
    data: null,
    error: null,
  };
  const input = req.body;

  try {
    result.data = await testRedisConnection(input);
  } catch (err) {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("/testRedisConnection API failed !", err);
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
  const input = req.body;

  try {
    result.data = await importFilesToRedis(input);
  } catch (err) {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("/importFilesToRedis API failed !", err);
    result.error = err;
    res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

export { router };
