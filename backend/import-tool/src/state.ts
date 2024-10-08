import type { IImportStats } from "./input-schema.js";

import { Socket } from "socket.io";
import { z } from "zod";

import * as InputSchemas from "./input-schema.js";

enum ImportStatus {
  IN_PROGRESS = "inProgress",
  ERROR_STOPPED = "errorStopped",
  PAUSED = "paused",
  SUCCESS = "success",
  PARTIAL_SUCCESS = "partialSuccess",
}

interface IImportCommonState {
  socketClient?: Socket | null;
  stats?: IImportStats;
  input?: z.infer<typeof InputSchemas.importDataToRedisSchema>;
  currentStatus?: ImportStatus;
  importErrors?: any[];
  fileIndex?: number;
}

interface IImportFilesState extends IImportCommonState {
  filePaths?: string[];
}

interface IImportArrayFileState extends IImportCommonState {
  fileContents?: any[];
}
interface IImportStreamFileState extends IImportCommonState {
  stream?: any;
  isStreamEnded?: boolean;
}

const socketState: {
  IMPORT_UPLOAD_DIR?: any;

  [socketId: string]:
    | IImportFilesState
    | IImportArrayFileState
    | IImportStreamFileState;
} = {};

export { socketState, ImportStatus };

export type {
  IImportFilesState,
  IImportArrayFileState,
  IImportCommonState,
  IImportStreamFileState,
};
