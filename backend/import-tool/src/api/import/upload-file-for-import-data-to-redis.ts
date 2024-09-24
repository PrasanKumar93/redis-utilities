import { Request } from "express";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import Busboy from "busboy";

import { socketState } from "../../state.js";
import { LoggerCls } from "../../utils/logger.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "../../utils/constants.js";

const setRootUploadDir = (rootDir: string) => {
  socketState.IMPORT_UPLOAD_DIR = join(rootDir, "import-uploads");
};

const getSocketUploadDir = (socketId: string) => {
  let folderPath = "";
  if (socketId) {
    folderPath = join(socketState.IMPORT_UPLOAD_DIR, socketId);
  }
  return folderPath;
};
const deleteSocketUploadDir = (socketId: string) => {
  let folderPath = getSocketUploadDir(socketId);

  if (folderPath && existsSync(folderPath)) {
    try {
      const files = readdirSync(folderPath);
      for (const file of files) {
        const filePath = join(folderPath, file);
        unlinkSync(filePath);
      }
      rmdirSync(folderPath);

      LoggerCls.info("Deleted uploadDir of socket: " + socketId);
    } catch (err) {
      err = LoggerCls.getPureError(err);
      LoggerCls.error(
        `Error occurred while deleting socket uploadDir: ${folderPath}`,
        err
      );
    }
  }
};

const validateFileExtension = (uploadType: string, filePath: string) => {
  let isValid = false;

  if (uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE) {
    isValid = filePath.endsWith(".json");
  } else if (uploadType == UPLOAD_TYPES_FOR_IMPORT.CSV_FILE) {
    isValid = filePath.endsWith(".csv");
  } else if (uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER) {
    isValid = filePath.endsWith(".zip"); //zip to be extracted
  }

  if (!isValid) {
    throw {
      userMessage: "Invalid file extension.",
    };
  }

  return isValid;
};

const uploadFileForImportDataToRedis = async (req: Request) => {
  let promObj = new Promise((resolve, reject) => {
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
      //TODO: validateFileExtension in UI and stop upload if invalid
      //TODO: validate file size

      //TODO json zip folder extract while validating
      //TODO: validate uploadType and file path (test from browser)

      try {
        const { filename, encoding, mimeType } = info;
        validateFileExtension(uploadType, filename);

        console.log(
          `socketId: ${socketId}, uploadType: ${uploadType}, filename: ${filename}`
        );
        if (socketId) {
          const uploadDir = getSocketUploadDir(socketId);
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          serverUploadPath = join(uploadDir, filename);
          file.pipe(createWriteStream(serverUploadPath));
        } else {
          throw "Invalid socketId for file upload.";
        }
      } catch (err) {
        file.resume().on("end", () => {
          LoggerCls.error("Reached the end, but did not read anything.");
          busboy.emit("error", err);
        });
        // busboy.emit("error", err);
      }
    });

    busboy.on("close", () => {
      result.data = {
        serverUploadPath: serverUploadPath,
        message: "File uploaded successfully !",
      };
      req.unpipe(busboy);
      resolve(result.data);
    });

    busboy.on("error", (err: any) => {
      req.unpipe(busboy);
      reject(err);
    });

    req.pipe(busboy);
  });

  return promObj;
};

export {
  uploadFileForImportDataToRedis,
  setRootUploadDir,
  deleteSocketUploadDir,
};
