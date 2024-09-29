import './UploadTypes.css';

import { UPLOAD_DROPDOWN_OPTIONS, UPLOAD_CATEGORY } from "@/app/constants";
import FileUpload from "@/app/components/FileUpload";
import { useEffect, useState } from 'react';

interface UploadTypesProps {
    uploadTypeOption: any;
    setUploadTypeOption: (value: any) => void;
    uploadPath: string;
    setUploadPath: (value: string) => void;
    evtClickEnterUploadPath: () => Promise<void>;

    fileUploadApiUrl?: string;
    socketId?: string;
}

const UploadTypes = ({
    uploadTypeOption,
    setUploadTypeOption,
    uploadPath,
    setUploadPath,
    evtClickEnterUploadPath,

    fileUploadApiUrl,
    socketId,

}: UploadTypesProps) => {

    //#region for browser upload
    const [fileUploadServerPath, setFileUploadServerPath] = useState<string>('');

    const evtFilePreUpload = (formData: FormData) => {
        if (formData) {
            formData.append('uploadType', uploadTypeOption.uploadType);
            if (socketId) {
                formData.append('socketId', socketId);
            }
        }
        return formData;
    }

    const evtFilePostUpload = (result: any) => {

        if (result?.data?.serverUploadPath) {
            const uploadedPath = result.data?.serverUploadPath;
            setFileUploadServerPath(uploadedPath);
            setUploadPath(uploadedPath);
        }
    }

    useEffect(() => {
        if (fileUploadServerPath) {
            evtClickEnterUploadPath();
        }
    }, [fileUploadServerPath]);
    //#endregion

    const handleUploadTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const selectedOption = UPLOAD_DROPDOWN_OPTIONS.find(option => option.value === selectedValue);
        if (selectedOption) {
            setUploadTypeOption(selectedOption);
        }
    };

    return (
        <div className="import-upload-type-container">
            <div className="upload-path-container fade-in-out-to-top">
                <div className="upload-path-select-ctr">

                    <span className="pg001-upload-lbl font-medium pg001-single-line-label">
                        Upload Type :
                    </span>

                    <select value={uploadTypeOption.value}
                        onChange={handleUploadTypeChange}
                        className="pg001-select" >
                        {UPLOAD_DROPDOWN_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {uploadTypeOption.category === UPLOAD_CATEGORY.BROWSER_UPLOAD && (
                    <div className="upload-textbox-ctr">

                        <FileUpload
                            fileUploadApiUrl={fileUploadApiUrl}
                            allowFileExtensions={uploadTypeOption.allowExtension}
                            preFileUploadCallback={evtFilePreUpload}
                            postFileUploadCallback={evtFilePostUpload}
                            tabIndex={2}
                        />
                    </div>
                )}

                {uploadTypeOption.category === UPLOAD_CATEGORY.SERVER_PATH && (
                    <div className="upload-textbox-ctr">
                        <span className="pg001-upload-lbl font-medium pg001-single-line-label">
                            Upload Path :
                        </span>
                        <input type="text" className="upload-path-textbox pg001-textbox"
                            placeholder={uploadTypeOption.placeholder}
                            id="upload-path-textbox"
                            value={uploadPath}
                            onChange={(e) => setUploadPath(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key.toLowerCase() === 'enter') {
                                    evtClickEnterUploadPath();
                                }
                            }}
                            tabIndex={2}
                        />

                        <div className="fas fa-arrow-circle-right upload-submit-icon"
                            title="Next"
                            onClick={evtClickEnterUploadPath}></div>
                    </div>
                )}



            </div>
        </div>
    );
}

export default UploadTypes;