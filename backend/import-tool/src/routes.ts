import express, { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "./utils/constants.js";
import { LoggerCls } from "./utils/logger.js";
import { testRedisConnection } from "./api/test-redis-connection.js";
import { importDataToRedis } from "./api/import/import-data-to-redis.js";
import { resumeImportDataToRedis } from "./api/import/resume-import-data-to-redis.js";
import { testJSONFormatterFn } from "./api/test-json-formatter-fn.js";
import { getSampleInputForJSONFormatterFn } from "./api/get-sample-input-for-json-formatter-fn.js";
import { uploadFileForImportDataToRedis } from "./api/import/upload-file-for-import-data-to-redis.js";

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
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

router.post("/importDataToRedis", async (req: Request, res: Response) => {
  const result: any = {
    data: null,
    error: null,
  };
  const input = req.body;

  try {
    result.data = await importDataToRedis(input);
  } catch (err) {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("/importDataToRedis API failed !", err);
    result.error = err;
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

router.post("/resumeImportDataToRedis", async (req: Request, res: Response) => {
  const result: any = {
    data: null,
    error: null,
  };
  const input = req.body;

  try {
    result.data = await resumeImportDataToRedis(input);
  } catch (err) {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("/resumeImportDataToRedis API failed !", err);
    result.error = err;
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

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
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
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
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    res.send(result);
  }
);

router.post(
  "/uploadFileForImportDataToRedis",
  async (req: Request, res: Response) => {
    return uploadFileForImportDataToRedis(req, res);
  }
);

export { router };
