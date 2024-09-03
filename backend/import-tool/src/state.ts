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
  isPaused?: boolean;
  importErrors?: any[];
  fileIndex?: number;
}

interface IImportFilesState extends IImportCommonState {
  filePaths?: string[];
}

interface IImportArrayFileState extends IImportCommonState {
  fileContents?: any[];
}

const socketState: {
  [socketId: string]: IImportFilesState | IImportArrayFileState;
} = {};

export { socketState, ImportStatus };

export type { IImportFilesState, IImportArrayFileState, IImportCommonState };
