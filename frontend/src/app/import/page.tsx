"use client";

import type { ImportFileError } from "../types";
import React, { useEffect, useState } from "react";

import './css/typography.css';
import './css/variables.css';
import './css/page.css';

import CodeMirrorEditor from '../components/CodeMirrorEditor';


import {
    testRedisConnection,
    importFilesToRedis,
    resumeImportFilesToRedis,
    testJSONFormatterFn,
    getSampleInputForJSONFormatterFn
} from "../utils/services";
import { infoToast } from "../utils/toast-util";

import { IMPORT_ANIMATE_CSS, IMPORT_STATUS, IMPORT_PAGE_TABS } from "../constants";
import { config } from "../config";

import { useSocket } from "./use-socket";


const defaultFunctionString = `function customJSONFormatter(jsonObj){

/**

1> Can modify jsonObj as needed

jsonObj.insertedAt = new Date() // add new field
jsonObj.productDetails.brandName = jsonObj.productDetails.brandName.toUpperCase() //update field
delete jsonObj.meta //delete field

2> Can custom assign jsonObj
jsonObj = {
  productId: jsonObj.productDetails.id,
  productName: jsonObj.productDetails.productDisplayName,
  price: jsonObj.productDetails.price,
  insertedAt: new Date(),
}
*/


 return jsonObj; // mandatory return 
}`;

const Page = () => {

    const [testRedisUrl, setTestRedisUrl] = useState(config.DEFAULT_REDIS_URL);

    const [redisConUrl, setRedisConUrl] = useState('');
    const [serverFolderPath, setServerFolderPath] = useState('');
    const [keyPrefix, setKeyPrefix] = useState('');
    const [idField, setIdField] = useState('');
    const [isStopOnError, setIsStopOnError] = useState(false);

    const [formatterFn, setFormatterFn] = useState(defaultFunctionString);
    const [formatterFnInput, setFormatterFnInput] = useState<any>({});
    const [formatterFnOutput, setFormatterFnOutput] = useState<any>(null);
    const [isValidFormatterFn, setIsValidFormatterFn] = useState(true);

    const [activeTabIndex, setActiveTabIndex] = useState(IMPORT_PAGE_TABS.LOGS);

    const {
        socketId,
        displayStats, setDisplayStats,
        displayErrors, setDisplayErrors,
        displayStatus, setDisplayStatus,
        bodyClasses, setBodyClasses,
        addToSet, removeFromSet,
        pauseImportFilesToRedis
    } = useSocket();

    useEffect(() => {
        const getSampleJSONInput = async () => {
            if (serverFolderPath) {
                const result = await getSampleInputForJSONFormatterFn({
                    serverFolderPath
                });
                if (result?.data?.content) {
                    console.log("sample file path :", result.data?.filePath);
                    console.log("sample file data :", result.data.content);
                    setFormatterFnInput(result.data.content);
                }
                else if (result?.error) {
                    setFormatterFnInput({});
                }
            }
        }
        getSampleJSONInput();
    }, [serverFolderPath]);

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
            isStopOnError,
            jsFunctionString: formatterFn
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
        if (isValidFormatterFn) {

            removeFromSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_PAUSE);

            if (!displayStatus) { // first time
                addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_START);

                await startImportFiles();

            } else if (displayStatus != IMPORT_STATUS.IN_PROGRESS) {
                await resumeImportFiles();
            }

        }
        else {
            infoToast("Please correct the formatter function before starting the import");
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

    const validateFormatterFn = async (code: string) => {

        if (code) {
            setFormatterFn(code);

            const testResult = await testJSONFormatterFn({
                jsFunctionString: code,
                paramsObj: formatterFnInput
            });

            if (testResult?.data) {
                setIsValidFormatterFn(true);
                setFormatterFnOutput(testResult?.data);
                setActiveTabIndex(IMPORT_PAGE_TABS.LOGS)
            }
            else if (testResult?.error) {
                setIsValidFormatterFn(false);
                const displayError: ImportFileError = {
                    message: "Error in formatter function ",
                    error: testResult?.error
                };
                setDisplayErrors((prev) => [...prev, displayError]);
                setActiveTabIndex(IMPORT_PAGE_TABS.ERRORS);
            }

            setTimeout(() => {
                const tabContainer = document.querySelector(".tab-container:not(.hide-tab-container)");
                if (tabContainer) {
                    tabContainer.scrollTop = tabContainer.scrollHeight;
                }
            }, 10);
        }
        else {
            setFormatterFn(defaultFunctionString);
            setIsValidFormatterFn(true);
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
                                        <div className="import-formatter-func-section">
                                            <div className="roboto-medium">Formatter function</div>
                                            <div className="import-formatter-func-field">

                                                <CodeMirrorEditor
                                                    initialValue={formatterFn}
                                                    className="import-formatter-func-textarea"
                                                    onBlur={validateFormatterFn}
                                                    tabIndex={6}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            <div className="action-container fade-in-out-to-top">
                                {displayStatus != IMPORT_STATUS.IN_PROGRESS ? (
                                    <div className="action-icons fas fa-play" title="Start/ Resume Import"
                                        onClick={() => evtClickPlay()}
                                        onKeyDown={(e) => {
                                            if (e.key.toLowerCase() === 'enter' || e.key === ' ') {
                                                evtClickPlay();
                                            }
                                        }}
                                        tabIndex={7} ></div>
                                ) : (
                                    <div className="action-icons fas fa-pause" title="Pause Import"
                                        onClick={() => evtClickPause()}
                                        onKeyDown={(e) => {
                                            if (e.key.toLowerCase() === 'enter' || e.key === ' ') {
                                                evtClickPause();
                                            }
                                        }}
                                        tabIndex={8}></div>
                                )}

                                {/* <div className="action-icons fas fa-ban" title="Cancel Import"
                                    onClick={evtClickCancel}
                                    onKeyDown={(e) => {
                                        if (e.key.toLowerCase() === 'enter' || e.key === ' ') {
                                            evtClickCancel();
                                        }
                                    }}
                                    tabIndex={9}></div> */}
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
                                        + (activeTabIndex == IMPORT_PAGE_TABS.LOGS ? "tab-title-active" : "")}
                                        onClick={() => setActiveTabIndex(IMPORT_PAGE_TABS.LOGS)}>
                                        Info
                                    </div>

                                    <div className={"tab-title roboto-bold "
                                        + (activeTabIndex == IMPORT_PAGE_TABS.ERRORS ? "tab-title-active" : "")}
                                        onClick={() => setActiveTabIndex(IMPORT_PAGE_TABS.ERRORS)}>
                                        Errors ({displayErrors.length})
                                    </div>
                                </div>
                                <div className={"tab-container "
                                    + (activeTabIndex == IMPORT_PAGE_TABS.ERRORS ? "hide-tab-container" : "")}>
                                    Status : {displayStatus || "Not started"}

                                    {formatterFnInput &&
                                        <>
                                            <hr />
                                            <details>
                                                <summary className="summary-tag">
                                                    Formatter function input (jsonObj) is file content :
                                                </summary>

                                                <pre>
                                                    <code>
                                                        {JSON.stringify(formatterFnInput, null, 4)}
                                                    </code>
                                                </pre>
                                            </details>
                                        </>
                                    }
                                    {formatterFnOutput &&
                                        <>
                                            <hr />

                                            <details>
                                                <summary className="summary-tag">
                                                    Formatter function output to be stored in Redis :
                                                </summary>
                                                <pre>
                                                    <code>
                                                        {JSON.stringify(formatterFnOutput, null, 4)}
                                                    </code>
                                                </pre>
                                            </details>
                                        </>
                                    }

                                </div>
                                <div className={"tab-container "
                                    + (activeTabIndex == IMPORT_PAGE_TABS.LOGS ? "hide-tab-container" : "")}>

                                    {displayErrors.map((error, index) => (
                                        <div key={index} className="error-log">
                                            <div className="error-log-path">
                                                {index + 1})
                                                {error.filePath ? 'FilePath : ' + error.filePath : ''}
                                                {error.message ? ' Message : ' + error.message : ''}
                                            </div>
                                            <div className="error-log-msg">
                                                {/* Error : */}
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