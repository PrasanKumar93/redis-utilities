import { UPLOAD_TYPES_OPTIONS } from "@/app/constants";

import './UploadTypes.css';

interface UploadTypesProps {
    uploadTypeOption: any;
    setUploadTypeOption: (value: any) => void;
    uploadPath: string;
    setUploadPath: (value: string) => void;
    evtClickEnterUploadPath: () => Promise<void>;
}

const UploadTypes = ({
    uploadTypeOption,
    setUploadTypeOption,
    uploadPath,
    setUploadPath,
    evtClickEnterUploadPath
}: UploadTypesProps) => {

    const handleUploadTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const selectedOption = UPLOAD_TYPES_OPTIONS.find(option => option.value === selectedValue);
        if (selectedOption) {
            setUploadTypeOption(selectedOption);
        }
    };

    return (
        <div className="import-upload-type-container">
            <div className="upload-path-container fade-in-out-to-top">
                <div className="upload-path-select-ctr">

                    <span className="pg001-upload-lbl roboto-medium pg001-single-line-label">
                        Upload Type :
                    </span>

                    <select value={uploadTypeOption.value}
                        onChange={handleUploadTypeChange}
                        className="pg001-select" >
                        {UPLOAD_TYPES_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                <div className="upload-path-textbox-ctr">
                    <span className="pg001-upload-lbl roboto-medium pg001-single-line-label">
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

                    <div className="fas fa-arrow-circle-right upload-path-submit-icon"
                        title="Next"
                        onClick={evtClickEnterUploadPath}></div>
                </div>


            </div>
        </div>
    );
}

export default UploadTypes;