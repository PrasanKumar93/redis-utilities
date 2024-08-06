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

interface IImportFilesState {
  socketClient?: Socket | null;
  filePaths?: string[];
  filePathIndex?: number;
  stats?: IImportStats;
  fileErrors?: any[];
  input?: z.infer<typeof InputSchemas.importFilesToRedisSchema>;
  currentStatus?: ImportStatus;
  isPaused?: boolean;
}

const socketState: {
  [socketId: string]: IImportFilesState;
} = {};

export { socketState, ImportStatus };

export type { IImportFilesState };
