import type { ImportStats } from "@/app/types";

import { IMPORT_PAGE_TABS } from "@/app/constants";

import './ImportStatsCount.css';

interface ImportStatsCountProps {
    displayStats: ImportStats;
    setActiveTabIndex: (index: number) => void;
    scrollTabContainer: () => void;
}

const ImportStatsCount = ({
    displayStats,
    setActiveTabIndex,
    scrollTabContainer
}: ImportStatsCountProps) => {

    return (
        <div className="import-count-container fade-in-out-to-top">
            <div className="count-container success-count-container">
                <div className="success-count-icon fas fa-check"></div>
                <div className="import-success-count">
                    {displayStats.processed} out of {displayStats.totalFiles}
                </div>
            </div>
            <div className="count-container error-count-container fade-in-out-to-top">
                <div className="error-count-icon fas fa-times"></div>
                <div className="import-error-count" title="View Error" onClick={() => {
                    setActiveTabIndex(IMPORT_PAGE_TABS.ERRORS);
                    scrollTabContainer();
                }}> {displayStats.failed} failed</div>
            </div>
        </div>
    );
}

export default ImportStatsCount;