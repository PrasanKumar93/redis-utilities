import React, { useState } from 'react';

import './index.css';

import { consoleLogError, errorAPIAlert, fileUploadRequest } from '@/app/utils/axios-util';
import { errorToast, infoToast } from '@/app/utils/toast-util';


interface FileUploadProps {
    fileUploadApiUrl?: string;
    allowFileExtensions?: string; //  like ".zip,.json,.csv"

    preFileUploadCallback?: (formData: FormData) => FormData;
    postFileUploadCallback?: (response: any) => void;

    tabIndex?: number;
}

const FileUpload = ({
    fileUploadApiUrl,
    allowFileExtensions,
    preFileUploadCallback,
    postFileUploadCallback,
    tabIndex,
}: FileUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileUploadProgress, setFileUploadProgress] = useState<number>(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event?.target?.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const animateFileUploadProgress = (progress: number) => {
        let elm = document.getElementById("comp-file-upload-progress");
        if (elm) {
            if (progress < 0 || progress > 100) {
                progress = 0;
            }
            elm.style.setProperty('--progress-value', progress.toString());
            setFileUploadProgress(progress)
        }
    }

    const handleUpload = async () => {
        if (selectedFile) {
            let formData = new FormData();

            if (preFileUploadCallback) {
                formData = preFileUploadCallback(formData);
            }
            formData.append('file', selectedFile);

            if (fileUploadApiUrl) {
                try {
                    const response = await fileUploadRequest(fileUploadApiUrl, formData, null, (progress: number) => {
                        animateFileUploadProgress(Number(progress));
                    });
                    const responseData = response?.data;

                    if (postFileUploadCallback) {
                        postFileUploadCallback(responseData);
                    }
                }
                catch (axiosError: any) {
                    const error = consoleLogError(axiosError);
                    if (error?.userMessage) {
                        errorToast(error.userMessage);
                    } else {
                        errorAPIAlert(fileUploadApiUrl);
                    }
                    animateFileUploadProgress(0);
                }
            }


        }
        else {
            infoToast('Please select a file to upload');
        }
    };

    return (
        <div className='comp-file-upload'>
            <input type="file" className='upload-file-elm'
                onChange={handleFileChange}
                {...(allowFileExtensions ? { accept: allowFileExtensions } : {})}
                tabIndex={tabIndex} />

            <div className={fileUploadProgress > 0 ? "progress-bar progress-bar-active" : "progress-bar"} id="comp-file-upload-progress">


                {fileUploadProgress > 0 && <div>{fileUploadProgress}%</div>}

                {fileUploadProgress == 0 && <div className="fas fa-upload upload-submit-icon"
                    title="Upload file to server"
                    onClick={handleUpload}
                ></div>}
            </div>

        </div>
    );
};

export default FileUpload;