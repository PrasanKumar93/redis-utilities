"use client";

import React from "react";

import './css/typography.css';
import './css/variables.css';
import './css/page.css';

const Page = () => {

    const ANIMATION_CSS = {
        CHOOSE_FOLDER_PATH: 'choose-folder-path',
        SHOW_IMPORT_PROCESS_CTR: 'show-import-process-ctr',
        IMPORT_START: 'import-start',
        IMPORT_PAUSE: 'import-pause',
        IMPORT_ERROR: 'import-error'
    }


    let tabClickState = 0;

    const evtClickLogTab = (_clickedElmState: number) => {
        const successTabElm = document.getElementById('tab-title-success');
        const failedTabElm = document.getElementById('tab-title-failed');
        const successContainerElm = document.getElementById('import-log-success-container');
        const failedContainerElm = document.getElementById('import-log-error-container');

        if (_clickedElmState != tabClickState) {
            successTabElm?.classList.toggle('tab-title-active');
            failedTabElm?.classList.toggle('tab-title-active');
            successContainerElm?.classList.toggle('error-tab-container');
            failedContainerElm?.classList.toggle('error-tab-container');
            tabClickState = _clickedElmState;
        }
    }

    const bodyClassAddRemove = (_action: string, _className: string) => {
        const bodyElm = document.getElementById('pg001-body');

        //@ts-ignore
        bodyElm?.classList[_action](_className);
    }
    const evtClickEnterConUrl = () => {
        const bodyElm = document.getElementById('pg001-body');

        const connectionStringTxtElm = bodyElm?.getElementsByClassName('con-url-textbox');
        if (connectionStringTxtElm) {
            //@ts-ignore
            let connectionStringVal = connectionStringTxtElm[0].value;
            if (connectionStringVal && connectionStringVal.length) {
                bodyClassAddRemove('add', ANIMATION_CSS.CHOOSE_FOLDER_PATH);
            }
        }
    }
    const evtClickPlayPause = () => {
        bodyClassAddRemove('add', ANIMATION_CSS.IMPORT_START);
        bodyClassAddRemove('toggle', ANIMATION_CSS.IMPORT_PAUSE);
    }
    const evtClickCancel = () => {
        bodyClassAddRemove('toggle', ANIMATION_CSS.IMPORT_ERROR);
    }

    const evtClickToggleTheme = () => {
        bodyClassAddRemove('toggle', 'light-theme')
    }

    const setUploadFolderPath = () => {
        let _folderPath = "/get/from/elm";
        bodyClassAddRemove('remove', ANIMATION_CSS.CHOOSE_FOLDER_PATH);
        bodyClassAddRemove('add', ANIMATION_CSS.SHOW_IMPORT_PROCESS_CTR);
        const fileNameLbl = document.getElementById('final-folder-path');
        if (fileNameLbl) {
            fileNameLbl.innerHTML = _folderPath;
        }
    }

    return (
        <div className="pg001-body roboto-regular import-pause" id="pg001-body">
            <div className="pg001-outer-container">
                <div className="heading roboto-black">
                    <i className="fas fa-file-import heading-icon"></i> <span>Import Tool</span>
                    <div className="theme-toggle fas fa-adjust" onClick={evtClickToggleTheme} title="Change Theme"></div>
                </div>
                <div className="con-url-outer-container">
                    <div className="con-url-container">
                        <div className="con-url-lbl roboto-medium pg001-single-line-label">Connection URL : </div>
                        <input type="text" placeholder="Enter Redis Connection URL" className="con-url-textbox pg001-textbox" />
                        <div className="fas fa-arrow-circle-right con-url-submit-icon enter" title="Enter" onClick={evtClickEnterConUrl}></div>
                        <div className="fas fa-check-circle con-url-submit-icon done"></div>
                    </div>
                </div>
                <div className="folder-path-outer-container">
                    <div className="folder-path-container fade-in-out-to-top">
                        <div className="folder-path-lbl roboto-medium pg001-single-line-label">Enter server folder path : </div>

                        <div className="folder-path-textbox-ctr">
                            <input type="text" className="folder-path-textbox pg001-textbox"
                                placeholder="/Users/tom/Documents/product-data"
                                id="folder-path-textbox"
                            />

                            <div className="fas fa-arrow-circle-right folder-path-submit-icon" onClick={(evt) => setUploadFolderPath()}></div>
                        </div>


                    </div>
                </div>
                <div className="import-process-outer-container">
                    <div id="final-folder-path-container" className="final-folder-path-container fade-in-out-to-top">
                        <div className="far fa-folder folder-icon"></div>
                        <div className="roboto-medium">Server Folder Path : </div>
                        <div id="final-folder-path" className="final-folder-path"></div>
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
                                                <input type="text" placeholder="products:" />
                                            </div>
                                            <div>
                                                <div className="import-option-title roboto-medium">Enter ID field</div>
                                                <input type="text" placeholder="productId" />
                                            </div>
                                            <div className="options-col">
                                                <input type="checkbox" id="import-check-stop-on-error" />
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
                                <div className="action-icons fas fa-play" title="Play/Pause" onClick={evtClickPlayPause} ></div>
                                <div className="action-icons fas fa-pause" title="Play/Pause" onClick={evtClickPlayPause} ></div>
                                <div className="action-icons fas fa-ban" title="Cancel" onClick={evtClickCancel}></div>
                            </div>
                            <div className="count-outer-container fade-in-out-to-top">
                                <div className="count-container success-count-container">
                                    <div className="success-count-icon fas fa-check"></div>
                                    <div className="import-success-count"> <span>10020</span> out of <span>44446</span></div>
                                </div>
                                <div className="count-container error-count-container fade-in-out-to-top">
                                    <div className="error-count-icon fas fa-times"></div>
                                    <div className="import-error-count"> <span>10</span> failed</div>
                                </div>
                            </div>
                        </div>

                        <div className="import-process-right-container">
                            <div className="tabs-outer-container fade-in-out-to-left">
                                <div className="tab-headings">
                                    <div className="tab-title roboto-bold tab-title-active" id="tab-title-success" onClick={() => evtClickLogTab(0)}>Success</div>
                                    <div className="tab-title roboto-bold" id="tab-title-failed" onClick={() => evtClickLogTab(1)}>Failed</div>
                                </div>
                                <div className="tab-container" id="import-log-success-container">
                                    Success
                                </div>
                                <div className="tab-container error-tab-container" id="import-log-error-container">
                                    Failed
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