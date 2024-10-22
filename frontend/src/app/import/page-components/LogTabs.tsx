import type { ImportFileError } from "@/app/types";

import { IMPORT_PAGE_TABS } from "@/app/constants";

import './LogTabs.css';

interface LogTabsProps {
    activeTabIndex: number;
    setActiveTabIndex: (value: number) => void;
    displayErrors: ImportFileError[];
    displayStatus: string;
    formatterFnInput: any;
    formatterFnOutput: any;
    sampleKey: string;
}

const LogTabs = ({
    activeTabIndex,
    setActiveTabIndex,
    displayErrors,
    displayStatus,
    formatterFnInput,
    formatterFnOutput,
    sampleKey,
}: LogTabsProps) => {

    return (
        <div className="import-log-tabs-container fade-in-out-to-left">
            <div className="tab-headings">

                <div className={"tab-title font-medium "
                    + (activeTabIndex == IMPORT_PAGE_TABS.LOGS ? "tab-title-active" : "")}
                    onClick={() => setActiveTabIndex(IMPORT_PAGE_TABS.LOGS)}>
                    Info
                </div>

                <div className={"tab-title font-medium "
                    + (activeTabIndex == IMPORT_PAGE_TABS.ERRORS ? "tab-title-active" : "")}
                    onClick={() => setActiveTabIndex(IMPORT_PAGE_TABS.ERRORS)}>
                    ErrorLogs ({displayErrors.length})
                </div>
            </div>
            <div className={"tab-container "
                + (activeTabIndex == IMPORT_PAGE_TABS.ERRORS ? "hide-tab-container" : "")}>

                <div className="tab-container-status font-bold">
                    Status : {displayStatus || "Not started"}
                </div>
                {formatterFnInput &&
                    <>
                        <hr />
                        <details>
                            <summary className="summary-tag font-medium">
                                Formatter function input  (sample file content as json object) :
                            </summary>

                            <pre>
                                <code>
                                    {JSON.stringify(formatterFnInput, null, 4)}
                                </code>
                            </pre>
                        </details>
                    </>
                }
                {sampleKey &&
                    <>
                        <hr />
                        <details>
                            <summary className="summary-tag font-medium">
                                Sample key to be stored in Redis :
                            </summary>
                            <pre>
                                <code>
                                    {sampleKey}
                                </code>
                            </pre>
                        </details>
                    </>
                }
                {formatterFnOutput &&
                    <>
                        <hr />

                        <details>
                            <summary className="summary-tag font-medium">
                                Formatter function output (sample value to be stored in Redis) :
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
                            {error.filePath ? ' FilePath : ' + error.filePath : ''}
                            {Number(error.fileIndex) >= 0 ? ' File Row Item #  ' + (Number(error.fileIndex) + 1) : ''}
                            {error.message ? ' Message : ' + error.message : ''}
                        </div>
                        <div className="error-log-msg">
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
    );
}

export default LogTabs;