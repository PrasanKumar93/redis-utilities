"use client";

import React, { useState } from "react";

import './css/typography.css';
import './css/variables.css';
import './css/page.css';

import { testRedisConnection, importFilesToRedis, resumeImportFilesToRedis } from "../utils/services";
import { IMPORT_ANIMATE_CSS, ImportStatus } from "../constants";
import { config } from "../config";

import { useSocket } from "./use-socket";


const Page = () => {

    const [testRedisUrl, setTestRedisUrl] = useState(config.DEFAULT_REDIS_URL);

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
        bodyClasses, setBodyClasses,
        addToSet, removeFromSet,
        pauseImportFilesToRedis
    } = useSocket();


    const evtClickEnterConUrl = async () => {

        if (testRedisUrl) {
            setRedisConUrl("");
            const result = await testRedisConnection({ redisConUrl: testRedisUrl });
            if (result?.data) {
                setRedisConUrl(testRedisUrl);

                addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.CHOOSE_FOLDER_PATH);
            }

        }
    }

    const evtClickEnterFolderPath = () => {

        if (serverFolderPath) {
            removeFromSet(setBodyClasses, IMPORT_ANIMATE_CSS.CHOOSE_FOLDER_PATH);
            addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.SHOW_IMPORT_PROCESS_CTR);
        }

    }

    const startImportFiles = async () => {
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
    const resumeImportFiles = async () => {

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
    const evtClickPlay = async () => {

        removeFromSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_PAUSE);

        if (!displayStatus) { // first time
            addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_START);

            await startImportFiles();

        } else if (displayStatus != ImportStatus.IN_PROGRESS) {
            await resumeImportFiles();
        }


    }

    const evtClickPause = () => {
        addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_PAUSE);
        pauseImportFilesToRedis();
    }

    // const evtClickCancel = () => {

    //     const result = confirm("Do you want to cancel the import?");

    //     if (result) {
    //         alert("Import Cancelled - dummy alert");
    //     }

    // }

    const evtClickToggleTheme = () => {

        if (bodyClasses.has(IMPORT_ANIMATE_CSS.LIGHT_THEME)) {
            removeFromSet(setBodyClasses, IMPORT_ANIMATE_CSS.LIGHT_THEME);
        }
        else {
            addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.LIGHT_THEME);
        }
    }



    return (
        <div className={"pg001-body roboto-regular "
            + (displayErrors.length ? "import-error " : "")
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
                            onChange={(e) => setTestRedisUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key.toLowerCase() === 'enter') {
                                    evtClickEnterConUrl();
                                }
                            }}
                            tabIndex={1}
                        />

                        <div className="fas fa-arrow-circle-right con-url-submit-icon enter"
                            title="Next"
                            onClick={evtClickEnterConUrl}></div>
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
                                onKeyDown={(e) => {
                                    if (e.key.toLowerCase() === 'enter') {
                                        evtClickEnterFolderPath();
                                    }
                                }}
                                tabIndex={2}
                            />

                            <div className="fas fa-arrow-circle-right folder-path-submit-icon"
                                title="Next"
                                onClick={(evt) => evtClickEnterFolderPath()}></div>
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
                                                <div className="import-option-title roboto-medium"> Key prefix</div>

                                                <input type="text" className="pg001-textbox"
                                                    placeholder="products:"
                                                    value={keyPrefix}
                                                    onChange={(e) => setKeyPrefix(e.target.value)}
                                                    tabIndex={3}
                                                />
                                            </div>
                                            <div>
                                                <div className="import-option-title roboto-medium"> ID field</div>
                                                <input type="text" className="pg001-textbox"
                                                    placeholder="productId"
                                                    value={idField}
                                                    onChange={(e) => setIdField(e.target.value)}
                                                    tabIndex={4}
                                                />
                                            </div>
                                            <div className="options-col">
                                                <input type="checkbox" className="pg001-checkbox"
                                                    id="import-check-stop-on-error"
                                                    checked={isStopOnError}
                                                    onChange={(e) => setIsStopOnError(e.target.checked)}
                                                    tabIndex={5}
                                                />
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
                                {displayStatus != ImportStatus.IN_PROGRESS ? (
                                    <div className="action-icons fas fa-play" title="Start/ Resume Import"
                                        onClick={() => evtClickPlay()}
                                        onKeyDown={(e) => {
                                            if (e.key.toLowerCase() === 'enter' || e.key === ' ') {
                                                evtClickPlay();
                                            }
                                        }}
                                        tabIndex={6} ></div>
                                ) : (
                                    <div className="action-icons fas fa-pause" title="Pause Import"
                                        onClick={() => evtClickPause()}
                                        onKeyDown={(e) => {
                                            if (e.key.toLowerCase() === 'enter' || e.key === ' ') {
                                                evtClickPause();
                                            }
                                        }}
                                        tabIndex={7}></div>
                                )}

                                {/* <div className="action-icons fas fa-ban" title="Cancel Import"
                                    onClick={evtClickCancel}
                                    onKeyDown={(e) => {
                                        if (e.key.toLowerCase() === 'enter' || e.key === ' ') {
                                            evtClickCancel();
                                        }
                                    }}
                                    tabIndex={8}></div> */}
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

                                    <div className={"tab-title roboto-bold "
                                        + (activeTabIndex == 0 ? "tab-title-active" : "")}
                                        onClick={() => setActiveTabIndex(0)}>
                                        Info
                                    </div>

                                    <div className={"tab-title roboto-bold "
                                        + (activeTabIndex == 1 ? "tab-title-active" : "")}
                                        onClick={() => setActiveTabIndex(1)}>
                                        Errors ({displayErrors.length})
                                    </div>
                                </div>
                                <div className={"tab-container "
                                    + (activeTabIndex == 1 ? "hide-tab-container" : "")}>
                                    Status : {displayStatus}

                                </div>
                                <div className={"tab-container "
                                    + (activeTabIndex == 0 ? "hide-tab-container" : "")}>

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