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
}

const LogTabs = ({
    activeTabIndex,
    setActiveTabIndex,
    displayErrors,
    displayStatus,
    formatterFnInput,
    formatterFnOutput,
}: LogTabsProps) => {

    return (
        <div className="import-log-tabs-container fade-in-out-to-left">
            <div className="tab-headings">

                <div className={"tab-title roboto-medium "
                    + (activeTabIndex == IMPORT_PAGE_TABS.LOGS ? "tab-title-active" : "")}
                    onClick={() => setActiveTabIndex(IMPORT_PAGE_TABS.LOGS)}>
                    Info
                </div>

                <div className={"tab-title roboto-medium "
                    + (activeTabIndex == IMPORT_PAGE_TABS.ERRORS ? "tab-title-active" : "")}
                    onClick={() => setActiveTabIndex(IMPORT_PAGE_TABS.ERRORS)}>
                    ErrorLogs ({displayErrors.length})
                </div>
            </div>
            <div className={"tab-container "
                + (activeTabIndex == IMPORT_PAGE_TABS.ERRORS ? "hide-tab-container" : "")}>

                <div className="tab-container-status roboto-bold-italic">
                    Status : {displayStatus || "Not started"}
                </div>
                {formatterFnInput &&
                    <>
                        <hr />
                        <details>
                            <summary className="summary-tag roboto-medium-italic">
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
                            <summary className="summary-tag roboto-medium-italic">
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