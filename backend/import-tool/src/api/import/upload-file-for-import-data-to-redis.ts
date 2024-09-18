import { Request, Response } from "express";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Busboy from "busboy";

import { LoggerCls } from "../../utils/logger.js";
import {
  HTTP_STATUS_CODES,
  DEFAULT_IMPORT_UPLOAD_DIR,
} from "../../utils/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadFileForImportDataToRedis = async (req: Request, res: Response) => {
  const result: any = {
    data: null,
    error: null,
  };
  let uploadType = "";
  let socketId = "";
  let serverUploadPath = "";

  const busboy = Busboy({ headers: req.headers });

  busboy.on("field", (name, val, info) => {
    if (name == "uploadType" && val) {
      uploadType = val;
    } else if (name == "socketId" && val) {
      socketId = val;
    }
  });

  busboy.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;

    //TODO: validate file extension
    //TODO: validate file size
    //TODO: delete file after socket disconnects, do it by exact path as socketId may not be
    //TODO: on field, on file not in order
    //TODO: change DEFAULT_IMPORT_UPLOAD_DIR to root of the project, dist folder
    console.log(
      `socketId: ${socketId}, uploadType: ${uploadType}, filename: ${filename}`
    );
    const uploadDir = join(
      __dirname,
      DEFAULT_IMPORT_UPLOAD_DIR,
      socketId,
      uploadType
    );
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    serverUploadPath = join(uploadDir, filename);
    file.pipe(createWriteStream(serverUploadPath));
  });

  busboy.on("finish", () => {
    if (!res.headersSent) {
      result.data = {
        serverUploadPath: serverUploadPath,
        message: "File uploaded successfully !",
      };
      res.json(result);
    }
  });

  busboy.on("error", (err: any) => {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("/uploadFileForImportDataToRedis API failed !", err);
    result.error = err;
    if (!res.headersSent) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(result);
    }
  });

  return req.pipe(busboy);
};

export { uploadFileForImportDataToRedis };
