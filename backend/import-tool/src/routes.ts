import express, { Request, Response } from "express";

import { CONSTANTS } from "./utils/constants.js";
import { LoggerCls } from "./utils/logger.js";
import { testRedisConnection } from "./api/test-redis-connection.js";
import { testJSONFormatterFn } from "./api/test-json-formatter-fn.js";
import { getSampleInputForJSONFormatterFn } from "./api/get-sample-input-for-json-formatter-fn.js";
import { importJSONFilesToRedis } from "./api/import-json/import-json-files-to-redis.js";
import { resumeImportJSONFilesToRedis } from "./api/import-json/resume-import-json-files-to-redis.js";
import { importArrayFileToRedis } from "./api/import-json/import-array-file-to-redis.js";
import { resumeImportArrayFileToRedis } from "./api/import-json/resume-import-array-file-to-redis.js";

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

router.post("/importArrayFileToRedis", async (req: Request, res: Response) => {
  const result: any = {
    data: null,
    error: null,
  };
  const input = req.body;

  try {
    result.data = await importArrayFileToRedis(input);
  } catch (err) {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("/importArrayFileToRedis API failed !", err);
    result.error = err;
    res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  res.send(result);
});

router.post(
  "/resumeImportArrayFileToRedis",
  async (req: Request, res: Response) => {
    const result: any = {
      data: null,
      error: null,
    };
    const input = req.body;

    try {
      result.data = await resumeImportArrayFileToRedis(input);
    } catch (err) {
      err = LoggerCls.getPureError(err);
      LoggerCls.error("/resumeImportArrayFileToRedis API failed !", err);
      result.error = err;
      res.status(CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    res.send(result);
  }
);

export { router };
