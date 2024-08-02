"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

import styles from "./page.module.css";

import { testRedisConnection, importFilesToRedis, resumeImportFilesToRedis } from "../utils/services";
import { config } from "../config";

interface ImportStats {
    totalFiles: number;
    processed: 0,
    failed: 0,
    totalTimeInMs: 0
}

interface ImportFileError {
    filePath: string;
    error: any;
}

const useSocket = () => {
    const [socketId, setSocketId] = useState<string>("");
    const [displayStats, setDisplayStats] = useState<ImportStats>({
        totalFiles: 0,
        processed: 0,
        failed: 0,
        totalTimeInMs: 0
    });
    const [displayErrors, setDisplayErrors] = useState<ImportFileError[]>([]);
    const [displayStatus, setDisplayStatus] = useState('');

    useEffect(() => {
        const socket = io(config.SOCKET_IO_URL);

        socket.on("connect", () => {
            console.log("Browser connected to socket server " + socket.id);
            setSocketId(socket.id || "");
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
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return {
        socketId,
        displayStats, setDisplayStats,
        displayErrors, setDisplayErrors,
        displayStatus, setDisplayStatus
    };
};


const Page = () => {
    const [testRedisUrl, setTestRedisUrl] = useState('');

    const [redisConUrl, setRedisConUrl] = useState('');
    const [serverFolderPath, setServerFolderPath] = useState('');
    const [keyPrefix, setKeyPrefix] = useState('');
    const [idField, setIdField] = useState('');
    const [isStopOnError, setIsStopOnError] = useState(false);


    const {
        socketId,
        displayStats, setDisplayStats,
        displayErrors, setDisplayErrors,
        displayStatus, setDisplayStatus
    } = useSocket();

    const handleClickStart = async () => {
        setDisplayErrors([]);

        const result = await importFilesToRedis({
            redisConUrl,
            serverFolderPath,
            keyPrefix,
            idField,
            socketId,
            isStopOnError
        });
        if (result?.data?.stats) {
            setDisplayStats(result.data.stats);
        }
        if (result?.data?.currentStatus) {
            setDisplayStatus(result.data.currentStatus);
        }
    }

    const handleClickResume = async () => {

        const result = await resumeImportFilesToRedis({
            socketId,
            isStopOnError
        });
        if (result?.data?.stats) {
            setDisplayStats(result.data.stats);
        }
        if (result?.data?.currentStatus) {
            setDisplayStatus(result.data.currentStatus);
        }
    }

    const handleBlurRedisConUrl = async () => {
        if (testRedisUrl) {
            setRedisConUrl("");
            const result = await testRedisConnection({ redisConUrl: testRedisUrl });
            if (result?.data) {
                setRedisConUrl(testRedisUrl);
            }

        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Import Tool</h2>
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="txtRedisConUrl">Redis connection URL* :</label>
                <input
                    type="text"
                    id="txtRedisConUrl"
                    placeholder="Enter redis connection URL"
                    style={{ width: "100%" }}
                    value={testRedisUrl}
                    onChange={(e) => setTestRedisUrl(e.target.value)}
                    onBlur={handleBlurRedisConUrl}
                />
                {redisConUrl && <span>Connected successfully to {redisConUrl}</span>}
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="txtFolderPath">Server folder path* :</label>
                <input
                    type="text"
                    id="txtFolderPath"
                    placeholder="Enter folder path"
                    style={{ width: "100%" }}
                    value={serverFolderPath}
                    onChange={(e) => setServerFolderPath(e.target.value)}
                />
            </div>

            <div className={styles.subHeader}>
                <h3>Options</h3>
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="txtKeyPrefix">Key prefix : </label>
                <input
                    type="text"
                    id="txtKeyPrefix"
                    placeholder="Enter key prefix"
                    value={keyPrefix}
                    onChange={(e) => setKeyPrefix(e.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="txtIdField">ID field : </label>
                <input
                    type="text"
                    id="txtIdField"
                    placeholder="Enter id field"
                    value={idField}
                    onChange={(e) => setIdField(e.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <label>
                    <input type="checkbox"
                        checked={isStopOnError}
                        onChange={(e) => setIsStopOnError(e.target.checked)}
                    />
                    Stop on error
                </label>
            </div>

            <div className={`${styles.buttons}`}>
                <button className={`${styles.button} ${styles.buttonStart}`}
                    onClick={handleClickStart} >
                    Start
                </button>

                <button className={`${styles.button} ${styles.buttonPause}  ${styles.disabled}`} >
                    Pause (NA)
                </button>

                <button className={`${styles.button} ${styles.buttonResume}`}
                    onClick={handleClickResume}>
                    Resume
                </button>

                <button className={`${styles.button} ${styles.buttonCancel}  ${styles.disabled}`} >
                    Cancel (NA)
                </button>

            </div>

            <div id="status" className={styles.importStatus}>
                Status: {displayStatus}

                <pre>
                    <code>
                        {JSON.stringify(displayStats, null, 2)}
                    </code>
                </pre>
            </div>
            <div id="errorLogs" className={styles.errorLog}>
                Errors : (NA)
                <pre>
                    <code>
                        {JSON.stringify(displayErrors, null, 2)}
                    </code>
                </pre>
            </div>
        </div>
    );
}

export default Page;