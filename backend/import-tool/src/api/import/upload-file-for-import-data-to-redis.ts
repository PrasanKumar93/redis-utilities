import { Request } from "express";
import fs from "node:fs";
import path from "node:path";
import Busboy from "busboy";

import { socketState } from "../../state.js";
import { LoggerCls } from "../../utils/logger.js";
import { UPLOAD_TYPES_FOR_IMPORT } from "../../utils/constants.js";
import { unzipFile } from "../../utils/file-reader.js";

const setRootUploadDir = (rootDir: string) => {
  socketState.IMPORT_UPLOAD_DIR = path.join(rootDir, "import-uploads");
};

const getSocketUploadDir = (socketId: string) => {
  let folderPath = "";
  if (socketId) {
    folderPath = path.join(socketState.IMPORT_UPLOAD_DIR, socketId);
  }
  return folderPath;
};

const deleteSocketUploadDir = (socketId: string) => {
  const folderPath = getSocketUploadDir(socketId);

  const deleteFolderRecursive = (folderPath: string) => {
    if (folderPath && fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);

      for (const file of files) {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      }
      fs.rmdirSync(folderPath);
    }
  };

  try {
    deleteFolderRecursive(folderPath);
    LoggerCls.info("Deleted uploadDir of socket: " + socketId);
  } catch (err) {
    err = LoggerCls.getPureError(err);
    LoggerCls.error("Error deleting uploadDir of socket: " + socketId, err);
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
      try {
        const { filename, encoding, mimeType } = info;
        validateFileExtension(uploadType, filename);

        console.log(
          `socketId: ${socketId}, uploadType: ${uploadType}, filename: ${filename}`
        );
        if (socketId) {
          const uploadDir = getSocketUploadDir(socketId);
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          serverUploadPath = path.join(uploadDir, filename);
          file.pipe(fs.createWriteStream(serverUploadPath));
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

    busboy.on("close", async () => {
      if (uploadType == UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER) {
        const zipFilePath = serverUploadPath;
        const destDir = zipFilePath.replace(".zip", "");
        const { unzippedPath } = await unzipFile(zipFilePath, destDir);

        result.data = {
          serverUploadPath: unzippedPath,
          message: "File uploaded & unzipped successfully !",
        };
      } else {
        result.data = {
          serverUploadPath: serverUploadPath,
          message: "File uploaded successfully !",
        };
      }

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
