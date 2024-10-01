"use client";

import type { ImportFileError } from "../types";
import React, { useEffect, useState } from "react";

import './page.css';

import PageHeader from '../components/PageHeader';
import RedisConnection from './page-components/RedisConnection';
import UploadTypes from './page-components/UploadTypes';
import ImportOptions from './page-components/ImportOptions';
import ImportActionButtons from './page-components/ImportActionButtons';
import ImportStatsCount from './page-components/ImportStatsCount';
import LogTabs from './page-components/LogTabs';

import {
    testRedisConnection,
    importDataToRedis,
    resumeImportDataToRedis,
    testJSONFormatterFn,
    getSampleInputForJSONFormatterFn,
    API_PATHS,
} from "../utils/services";
import { errorToast, infoToast } from "../utils/toast-util";
import { encryptData } from "../utils/crypto-util";

import {
    IMPORT_ANIMATE_CSS,
    IMPORT_STATUS,
    IMPORT_PAGE_TABS,
    UPLOAD_DROPDOWN_OPTIONS,
    UPLOAD_TYPES_FOR_IMPORT,
} from "../constants";
import { config } from "../config";

import { useSocket } from "./use-socket";


const infoIconFunctionString = `function customJSONFormatter(jsonObj){

// Can modify jsonObj as needed

jsonObj.insertedAt = new Date() // add new field
jsonObj.brandName = jsonObj.brandName.toUpperCase() //update field
delete jsonObj.meta //delete field

// OR can assign new jsonObj

jsonObj = {
  productId: jsonObj.id,
  productName: jsonObj.productDisplayName,
  price: jsonObj.price,
  insertedAt: new Date(),
}

 return jsonObj; // mandatory return 
}`;

const defaultFunctionString = `function customJSONFormatter(jsonObj){



 return jsonObj; // mandatory return 
}`;

const Page = () => {

    const [testRedisUrl, setTestRedisUrl] = useState(config.DEFAULT_REDIS_URL);

    const [redisConUrl, setRedisConUrl] = useState('');
    const [uploadPath, setUploadPath] = useState('');
    const [keyPrefix, setKeyPrefix] = useState('');
    const [idField, setIdField] = useState('');
    const [isStopOnError, setIsStopOnError] = useState(true);

    const [formatterFn, setFormatterFn] = useState(defaultFunctionString);
    const [formatterFnInput, setFormatterFnInput] = useState<any>({});
    const [formatterFnOutput, setFormatterFnOutput] = useState<any>(null);
    const [isValidFormatterFn, setIsValidFormatterFn] = useState(false);

    const [activeTabIndex, setActiveTabIndex] = useState(IMPORT_PAGE_TABS.LOGS);
    const [isShowLoader, setIsShowLoader] = useState(false);
    const [uploadTypeOption, setUploadTypeOption] = useState(UPLOAD_DROPDOWN_OPTIONS[0]);
    const [isAllUploadTypes, setIsAllUploadTypes] = useState(false);

    const gitTag = config.GIT_TAG;

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

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            evtClickPause();
            event.preventDefault();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };

    }, []);


    const evtClickEnterConUrl = async () => {

        if (testRedisUrl) {
            setRedisConUrl("");
            setIsShowLoader(true);

            const encryptedRedisUrl = await encryptData(testRedisUrl);
            const result = await testRedisConnection({
                redisConUrlEncrypted: encryptedRedisUrl
            });
            if (result?.data) {
                setRedisConUrl(testRedisUrl);

                addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.CHOOSE_UPLOAD_PATH);

                if (config.FROM_DOCKER === "Y") {
                    //Showing all upload types for application running locally (Non docker)
                    setIsAllUploadTypes(true);
                }
            }
            setIsShowLoader(false);

        }
    }

    const validateUploadPath = () => {
        let isValid = false;

        if (uploadPath) {
            if (uploadTypeOption.uploadType === UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE) {
                isValid = !!(uploadPath.match(/\.json$/)?.length);
            }
            else if (uploadTypeOption.uploadType === UPLOAD_TYPES_FOR_IMPORT.CSV_FILE) {
                isValid = !!(uploadPath.match(/\.csv$/)?.length);
            }
            else if (uploadTypeOption.uploadType === UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER) {
                // should not end with any file extension
                isValid = !(uploadPath.match(/\.\w+$/)?.length);
            }

        }

        return isValid;
    }

    const evtClickEnterUploadPath = async () => {

        const isValid = validateUploadPath();
        if (!isValid) {
            errorToast("Invalid upload path!");
        }
        else {

            setIsShowLoader(true);

            const result = await getSampleInputForJSONFormatterFn({
                uploadType: uploadTypeOption.uploadType,
                uploadPath: uploadPath
            });
            if (result?.data?.content) {
                console.log("sample file path :", result.data?.filePath);
                console.log("sample file data :", result.data.content);
                setFormatterFnInput(result.data.content);

                removeFromSet(setBodyClasses, IMPORT_ANIMATE_CSS.CHOOSE_UPLOAD_PATH);
                addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.SHOW_IMPORT_PROCESS_CTR);
            }
            else if (result?.error) {
                setFormatterFnInput({});
            }
            setIsShowLoader(false);

        }

    }

    const startImportFiles = async () => {
        setDisplayErrors([]);

        const encryptedRedisUrl = await encryptData(redisConUrl);

        const result = await importDataToRedis({
            redisConUrlEncrypted: encryptedRedisUrl,
            uploadType: uploadTypeOption.uploadType,
            uploadPath,
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

        const result = await resumeImportDataToRedis({
            socketId,
            isStopOnError,
            uploadType: uploadTypeOption.uploadType,
            uploadPath: uploadPath
        });

        if (result?.data?.stats) {
            setDisplayStats(result.data.stats);
        }
        if (result?.data?.currentStatus) {
            setDisplayStatus(result.data.currentStatus);
        }
    }
    const evtClickPlay = async () => {

        if (!displayStatus) { // first time
            const isValid = await validateFormatterFn(formatterFn);

            if (isValid) {
                removeFromSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_PAUSE);
                addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_START);

                await startImportFiles();
            }

        } else if (displayStatus != IMPORT_STATUS.IN_PROGRESS) {
            removeFromSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_PAUSE);

            await resumeImportFiles();
        }

    }

    const evtClickPause = () => {
        addToSet(setBodyClasses, IMPORT_ANIMATE_CSS.IMPORT_PAUSE);
        pauseImportFilesToRedis();
    }

    const validateFormatterFn = async (code: string) => {
        let isValid = false;

        if (!code) {
            code = "";
        }

        setFormatterFn(code);

        const testResult = await testJSONFormatterFn({ // validate key & formatter function
            idField: idField,
            keyPrefix: keyPrefix,

            jsFunctionString: code,
            paramsObj: formatterFnInput
        });

        if (testResult?.data) {
            isValid = true;
            setFormatterFnOutput(testResult?.data);
            setActiveTabIndex(IMPORT_PAGE_TABS.LOGS)
        }
        else if (testResult?.error) {
            isValid = false;
            const displayError: ImportFileError = {
                message: "Error in Import Options ",
                error: testResult?.error
            };
            setDisplayErrors((prev) => [...prev, displayError]);
            setActiveTabIndex(IMPORT_PAGE_TABS.ERRORS);
        }
        else if (code == "") {
            isValid = true;
            setFormatterFnOutput(formatterFnInput);
            setActiveTabIndex(IMPORT_PAGE_TABS.LOGS)
        }

        setIsValidFormatterFn(isValid);
        scrollTabContainer();

        return isValid;
    }

    const scrollTabContainer = () => {

        setTimeout(() => {
            const tabContainer = document.querySelector(".tab-container:not(.hide-tab-container)");
            if (tabContainer) {
                tabContainer.scrollTop = tabContainer.scrollHeight;
            }
        }, 10);

    }

    return (
        <div className={"pg001-body font-regular "
            + (displayErrors.length ? "import-error " : "")
            + Array.from(bodyClasses).join(" ")
        }
            id="pg001-body">

            <div className="pg001-outer-container">
                <PageHeader isShowLoader={isShowLoader} headerIconCls="fas fa-file-import" headerLabel="Import Tool" pageVersion={gitTag} />

                <RedisConnection
                    testRedisUrl={testRedisUrl} setTestRedisUrl={setTestRedisUrl}
                    evtClickEnterConUrl={evtClickEnterConUrl}
                />

                <UploadTypes
                    uploadTypeOption={uploadTypeOption} setUploadTypeOption={setUploadTypeOption}
                    uploadPath={uploadPath} setUploadPath={setUploadPath}
                    evtClickEnterUploadPath={evtClickEnterUploadPath}

                    isAllUploadTypes={isAllUploadTypes}
                    fileUploadApiUrl={API_PATHS.uploadFileForImportDataToRedis}
                    socketId={socketId}
                />

                <div className="import-process-outer-container">

                    <div id="final-upload-path-container" className="final-upload-path-container fade-in-out-to-top">
                        <div className="far fa-folder folder-icon"></div>
                        <div className="pg001-single-line-label font-medium">Upload Path : </div>
                        <div id="final-upload-path" className="final-upload-path">{uploadPath}</div>
                    </div>

                    <div className="import-process-container">

                        <div className="import-process-left-container">

                            <ImportOptions
                                keyPrefix={keyPrefix} setKeyPrefix={setKeyPrefix}
                                idField={idField} setIdField={setIdField}
                                isStopOnError={isStopOnError} setIsStopOnError={setIsStopOnError}
                                displayStatus={displayStatus}
                                infoIconFunctionString={infoIconFunctionString}
                                formatterFn={formatterFn} validateFormatterFn={validateFormatterFn}
                            />

                            <ImportActionButtons
                                displayStatus={displayStatus}
                                evtClickPlay={evtClickPlay}
                                evtClickPause={evtClickPause}
                            />

                            <ImportStatsCount
                                displayStats={displayStats}
                                setActiveTabIndex={setActiveTabIndex}
                                scrollTabContainer={scrollTabContainer}
                            />
                        </div>

                        <div className="import-process-right-container">
                            <LogTabs
                                activeTabIndex={activeTabIndex} setActiveTabIndex={setActiveTabIndex}
                                displayErrors={displayErrors}
                                displayStatus={displayStatus}
                                formatterFnInput={formatterFnInput}
                                formatterFnOutput={formatterFnOutput}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Page;