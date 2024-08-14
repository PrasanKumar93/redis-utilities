import type { ImportStats, ImportFileError } from "../types";

import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

import { config } from "../config";
import { IMPORT_ANIMATE_CSS, IMPORT_STATUS } from "../constants";

const addToSet = (setterFn: any, value: string) => {
  setterFn((prevSet: Set<string>) => {
    const newSet = new Set(prevSet);
    newSet.add(value);
    return newSet;
  });
};
const removeFromSet = (setterFn: any, value: string) => {
  setterFn((prevSet: Set<string>) => {
    const newSet = new Set(prevSet);
    newSet.delete(value);
    return newSet;
  });
};

const useSocket = () => {
  const [socketId, setSocketId] = useState<string>("");
  const [displayStats, setDisplayStats] = useState<ImportStats>({
    totalFiles: 0,
    processed: 0,
    failed: 0,
    totalTimeInMs: 0,
  });
  const [displayErrors, setDisplayErrors] = useState<ImportFileError[]>([]);
  const [displayStatus, setDisplayStatus] = useState("NA");
  const [bodyClasses, setBodyClasses] = useState(new Set<string>());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(config.SOCKET_IO_URL);
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Browser connected to socket server " + socket?.id);
      setSocketId(socket?.id || "");
    });

    socket.on("error", (error) => {
      console.error("Socket error", error);
    });

    socket.on("importStats", (stats) => {
      if (stats?.totalFiles) {
        setDisplayStats(stats);
      }
    });

    socket.on("importFileError", (info) => {
      if (info?.filePath) {
        setDisplayErrors((prev) => [...prev, info]);
      }
    });

    socket.on("importStatus", (status) => {
      if (status) {
        setDisplayStatus(status);

        if (status == IMPORT_STATUS.ERROR_STOPPED) {
          addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_PAUSE);
        } else if (
          status == IMPORT_STATUS.SUCCESS ||
          status == IMPORT_STATUS.PARTIAL_SUCCESS
        ) {
          addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_COMPLETE);
        }
      }
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const pauseImportFilesToRedis = () => {
    const socket = socketRef.current;
    socket?.emit("pauseImportFilesToRedis", true);
  };

  return {
    socketId,
    displayStats,
    setDisplayStats,
    displayErrors,
    setDisplayErrors,
    displayStatus,
    setDisplayStatus,
    bodyClasses,
    setBodyClasses,
    addToSet,
    removeFromSet,
    pauseImportFilesToRedis,
  };
};

export { useSocket };
