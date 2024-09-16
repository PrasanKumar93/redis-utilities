import { IMPORT_STATUS } from "@/app/constants";

import './ImportActionButtons.css';

interface ImportActionButtonsProps {
    displayStatus: string;
    evtClickPlay: () => void;
    evtClickPause: () => void;
}

const ImportActionButtons = ({
    displayStatus,
    evtClickPlay,
    evtClickPause
}: ImportActionButtonsProps) => {
    return (
        <div className="import-action-container fade-in-out-to-top">
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
        </div>
    );
}

export default ImportActionButtons;