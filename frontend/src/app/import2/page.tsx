"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

import './css/typography.css';
import './css/variables.css';
import './css/page.css';

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


const ANIMATION_CSS = {
    CHOOSE_FOLDER_PATH: 'choose-folder-path',
    SHOW_IMPORT_PROCESS_CTR: 'show-import-process-ctr',
    IMPORT_START: 'import-start',
    IMPORT_PAUSE: 'import-pause',
    IMPORT_ERROR: 'import-error',
    IMPORT_COMPLETE: 'import-complete'
}

enum ImportStatus {
    IN_PROGRESS = "inProgress",
    ERROR_STOPPED = "errorStopped",
    SUCCESS = "success",
    PARTIAL_SUCCESS = "partialSuccess",
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
    const [bodyClasses, setBodyClasses] = useState(new Set<string>());

    const addBodyClass = (value: string) => {
        setBodyClasses((prevSet) => {
            const newSet = new Set(prevSet);
            newSet.add(value);
            return newSet;
        });
    };
    const removeBodyClass = (value: string) => {
        setBodyClasses((prevSet) => {
            const newSet = new Set(prevSet);
            newSet.delete(value);
            return newSet;
        });
    };

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

                if (status == ImportStatus.ERROR_STOPPED) {
                    addBodyClass(ANIMATION_CSS.IMPORT_PAUSE);
                } else if (status == ImportStatus.SUCCESS || status == ImportStatus.PARTIAL_SUCCESS) {
                    addBodyClass(ANIMATION_CSS.IMPORT_COMPLETE);
                }
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
        displayStatus, setDisplayStatus,
        bodyClasses, addBodyClass, removeBodyClass
    };
};


const Page = () => {

    const [testRedisUrl, setTestRedisUrl] = useState('');

    const [redisConUrl, setRedisConUrl] = useState('');
    const [serverFolderPath, setServerFolderPath] = useState('');
    const [keyPrefix, setKeyPrefix] = useState('');
    const [idField, setIdField] = useState('');
    const [isStopOnError, setIsStopOnError] = useState(false);

    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const {
        socketId,
        displayStats, setDisplayStats,
        displayErrors, setDisplayErrors,
        displayStatus, setDisplayStatus,
        bodyClasses, addBodyClass, removeBodyClass
    } = useSocket();



    const evtClickLogTab = (_clickedTabIndex: number) => {
        const successTabElm = document.getElementById('tab-title-success');
        const failedTabElm = document.getElementById('tab-title-failed');
        const successContainerElm = document.getElementById('import-log-success-container');
        const failedContainerElm = document.getElementById('import-log-error-container');

        if (_clickedTabIndex != activeTabIndex) {
            successTabElm?.classList.toggle('tab-title-active');
            failedTabElm?.classList.toggle('tab-title-active');
            successContainerElm?.classList.toggle('error-tab-container');
            failedContainerElm?.classList.toggle('error-tab-container');
            setActiveTabIndex(_clickedTabIndex);
        }
    }



    const handleValidRedisConUrl = async () => {
        if (testRedisUrl) {
            setRedisConUrl("");
            const result = await testRedisConnection({ redisConUrl: testRedisUrl });
            if (result?.data) {
                setRedisConUrl(testRedisUrl);
            }

        }
    };
    const evtClickEnterConUrl = async () => {

        if (testRedisUrl) {
            await handleValidRedisConUrl();
            addBodyClass(ANIMATION_CSS.CHOOSE_FOLDER_PATH);
        }
    }

    const handleStart = async () => {
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
    const handleResume = async () => {

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
    const evtClickPlayPause = async (isPlay: boolean) => {

        if (isPlay) {
            removeBodyClass(ANIMATION_CSS.IMPORT_PAUSE);

            if (!displayStatus) { // first time
                addBodyClass(ANIMATION_CSS.IMPORT_START);

                await handleStart();

            } else if (displayStatus == ImportStatus.ERROR_STOPPED) {
                await handleResume();
            }
        }
        else {
            addBodyClass(ANIMATION_CSS.IMPORT_PAUSE);
        }

    }
    const evtClickCancel = () => {
    }

    const evtClickToggleTheme = () => {

        if (bodyClasses.has('light-theme')) {
            removeBodyClass('light-theme');
        }
        else {
            addBodyClass('light-theme');
        }
    }

    const evtClickEnterFolderPath = () => {

        if (serverFolderPath) {
            removeBodyClass(ANIMATION_CSS.CHOOSE_FOLDER_PATH);
            addBodyClass(ANIMATION_CSS.SHOW_IMPORT_PROCESS_CTR);
        }

    }

    return (
        <div className={"pg001-body roboto-regular " + (displayErrors.length ? "import-error " : "")
            + Array.from(bodyClasses).join(" ")
        }
            id="pg001-body">
            <div className="pg001-outer-container">
                <div className="heading roboto-black">
                    <i className="fas fa-file-import heading-icon"></i> <span>Import Tool</span>
                    <div className="theme-toggle fas fa-adjust" onClick={evtClickToggleTheme} title="Change Theme"></div>
                </div>
                <div className="con-url-outer-container">
                    <div className="con-url-container">
                        <div className="con-url-lbl roboto-medium pg001-single-line-label">Connection URL : </div>

                        <input type="text"
                            placeholder="Enter Redis Connection URL"
                            className="con-url-textbox pg001-textbox"
                            value={testRedisUrl}
                            onChange={(e) => setTestRedisUrl(e.target.value)} />

                        <div className="fas fa-arrow-circle-right con-url-submit-icon enter" title="Enter" onClick={evtClickEnterConUrl}></div>
                        <div className="fas fa-check-circle con-url-submit-icon done"></div>
                    </div>
                </div>
                <div className="folder-path-outer-container">
                    <div className="folder-path-container fade-in-out-to-top">
                        <div className="folder-path-lbl roboto-medium pg001-single-line-label">Enter server folder path* : </div>

                        <div className="folder-path-textbox-ctr">

                            <input type="text" className="folder-path-textbox pg001-textbox"
                                placeholder="/Users/tom/Documents/product-data"
                                id="folder-path-textbox"
                                value={serverFolderPath}
                                onChange={(e) => setServerFolderPath(e.target.value)}
                            />

                            <div className="fas fa-arrow-circle-right folder-path-submit-icon" onClick={(evt) => evtClickEnterFolderPath()}></div>
                        </div>


                    </div>
                </div>
                <div className="import-process-outer-container">
                    <div id="final-folder-path-container" className="final-folder-path-container fade-in-out-to-top">
                        <div className="far fa-folder folder-icon"></div>
                        <div className="roboto-medium">Server Folder Path : </div>
                        <div id="final-folder-path" className="final-folder-path">{serverFolderPath}</div>
                    </div>
                    <div className="import-process-container">

                        <div className="import-process-left-container">
                            <div className="options-container  fade-in-out-to-top">
                                <fieldset>

                                    <legend className="roboto-bold-italic">Options</legend>
                                    <div className="options">

                                        <div className="options-row">
                                            <div>
                                                <div className="import-option-title roboto-medium">Enter key prefix</div>

                                                <input type="text" placeholder="products:"
                                                    value={keyPrefix}
                                                    onChange={(e) => setKeyPrefix(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <div className="import-option-title roboto-medium">Enter ID field</div>
                                                <input type="text" placeholder="productId"
                                                    value={idField}
                                                    onChange={(e) => setIdField(e.target.value)} />
                                            </div>
                                            <div className="options-col">
                                                <input type="checkbox" id="import-check-stop-on-error"
                                                    checked={isStopOnError}
                                                    onChange={(e) => setIsStopOnError(e.target.checked)} />
                                                <label htmlFor="import-check-stop-on-error" className="roboto-medium">Stop on error</label>
                                            </div>
                                        </div>
                                        {/* <div className="import-formatter-func-section">
                                            <div className="roboto-medium">Formatter function</div>
                                            <div className="import-formatter-func-field">
                                                <textarea name="" id="" className="import-formatter-func-textarea roboto-regular" placeholder="Enter formatter function"></textarea>
                                            </div>
                                        </div> */}
                                    </div>
                                </fieldset>
                            </div>
                            <div className="action-container fade-in-out-to-top">
                                <div className="action-icons fas fa-play" title="Play" onClick={() => evtClickPlayPause(true)} ></div>
                                <div className="action-icons fas fa-pause" title="Pause" onClick={() => evtClickPlayPause(false)} ></div>
                                <div className="action-icons fas fa-ban" title="Cancel" onClick={evtClickCancel}></div>
                            </div>
                            <div className="count-outer-container fade-in-out-to-top">
                                <div className="count-container success-count-container">
                                    <div className="success-count-icon fas fa-check"></div>
                                    <div className="import-success-count">
                                        {displayStats.processed} out of {displayStats.totalFiles}
                                    </div>
                                </div>
                                <div className="count-container error-count-container fade-in-out-to-top">
                                    <div className="error-count-icon fas fa-times"></div>
                                    <div className="import-error-count"> {displayStats.failed} failed</div>
                                </div>
                            </div>
                        </div>

                        <div className="import-process-right-container">
                            <div className="tabs-outer-container fade-in-out-to-left">
                                <div className="tab-headings">
                                    <div className="tab-title roboto-bold tab-title-active" id="tab-title-success" onClick={() => evtClickLogTab(0)}>Info</div>
                                    <div className="tab-title roboto-bold" id="tab-title-failed" onClick={() => evtClickLogTab(1)}>Errors ({displayErrors.length}) </div>
                                </div>
                                <div className="tab-container" id="import-log-success-container">
                                    Status : {displayStatus}

                                </div>
                                <div className="tab-container error-tab-container" id="import-log-error-container">
                                    {displayErrors.map((error, index) => (
                                        <div key={index} className="error-log">
                                            <div className="error-log-path">
                                                {index + 1}) FilePath : {error.filePath}</div>
                                            <div className="error-log-msg">
                                                Error :
                                                <pre>
                                                    <code>
                                                        {JSON.stringify(error.error, null, 4)}
                                                    </code>
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Page;