import express, { Request, Response } from "express";

import { CONSTANTS } from "./utils/constants.js";
import {
  importJSONFilesToRedis,
  resumeImportJSONFilesToRedis,
} from "./service-impl.js";
import { LoggerCls } from "./utils/logger.js";
import { testRedisConnection } from "./api/test-redis-connection.js";
import { testJSONFormatterFn } from "./api/test-json-formatter-fn.js";
import { getSampleInputForJSONFormatterFn } from "./api/get-sample-input-for-json-formatter-fn.js";

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
    result.data = await importJSONFilesToRedis(input);
  } catch (err) {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("/importFilesToRedis API failed !", err);
    result.error = err;
    res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

router.post(
  "/resumeImportFilesToRedis",
  async (req: Request, res: Response) => {
    const result: any = {
      data: null,
      error: null,
    };
    const input = req.body;

    try {
      result.data = await resumeImportJSONFilesToRedis(input);
    } catch (err) {
      err = LoggerCls.getPureError(err);
      LoggerCls.error("/resumeImportFilesToRedis API failed !", err);
      result.error = err;
      res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    res.send(result);
  }
);

router.post("/testJSONFormatterFn", async (req: Request, res: Response) => {
  const result: any = {
    data: null,
    error: null,
  };
  const input = req.body;

  try {
    result.data = await testJSONFormatterFn(input);
  } catch (err) {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("/testJSONFormatterFn API failed !", err);
    result.error = err;
    res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

router.post(
  "/getSampleInputForJSONFormatterFn",
  async (req: Request, res: Response) => {
    const result: any = {
      data: null,
      error: null,
    };
    const input = req.body;

    try {
      result.data = await getSampleInputForJSONFormatterFn(input);
    } catch (err) {
      err = LoggerCls.getPureError(err);
      LoggerCls.error("/getSampleInputForJSONFormatterFn API failed !", err);
      result.error = err;
      res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    res.send(result);
  }
);

export { router };
