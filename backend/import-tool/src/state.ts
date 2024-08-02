import type { IImportStats } from "./input-schema.js";
import { Socket } from "socket.io";

interface IImportFilesState {
  socketClient?: Socket;
  filePaths?: string[];
  filePathIndex?: number;
  stats?: IImportStats;
  fileErrors?: any[];
}

const socketState: {
  [socketId: string]: IImportFilesState;
} = {};

export { socketState };

export type { IImportFilesState };
