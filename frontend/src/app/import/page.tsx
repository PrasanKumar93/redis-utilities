"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

import { testRedisConnection, importFilesToRedis } from "../utils/services";



const Page = () => {
    const [testRedisUrl, setTestRedisUrl] = useState('');

    const [redisConUrl, setRedisConUrl] = useState('');
    const [serverFolderPath, setServerFolderPath] = useState('');
    const [keyPrefix, setKeyPrefix] = useState('');
    const [idField, setIdField] = useState('');

    const [displayStats, setDisplayStats] = useState({
        totalFiles: 0,
        processed: 0,
        failed: 0,
        totalTimeInMs: 0
    });

    const handleClickStart = async () => {
        const result = await importFilesToRedis({
            redisConUrl,
            serverFolderPath,
            keyPrefix,
            idField
        });
        if (result?.data?.stats) {
            const stats = result.data.stats;
            setDisplayStats(stats);
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
            <div className={`${styles.inputGroup} ${styles.disabled}`}>
                <label><input type="checkbox" /> Stop on error (NA) </label>
            </div>

            <div className={`${styles.buttons}`}>
                <button className={`${styles.button} ${styles.buttonStart}`}
                    onClick={handleClickStart} >
                    Start
                </button>

                <button className={`${styles.button} ${styles.buttonPause}  ${styles.disabled}`} >
                    Pause (NA)
                </button>

                <button className={`${styles.button} ${styles.buttonResume}  ${styles.disabled}`} >
                    Resume (NA)
                </button>

                <button className={`${styles.button} ${styles.buttonCancel}  ${styles.disabled}`} >
                    Cancel (NA)
                </button>

            </div>

            <div id="status" className={styles.importStatus}>
                Status: In Progress*

                <pre>
                    <code>
                        {JSON.stringify(displayStats, null, 2)}
                    </code>
                </pre>
            </div>
            <div id="errorLogs" className={styles.errorLog}>
                Errors : (NA) <br />
            </div>
        </div>
    );
}

export default Page;