import './index.css';

import React, { useEffect, useState } from 'react';
import Loader from '../Loader';
import {
    IMPORT_PAGE_THEMES,
} from "../../constants";

interface PageHeaderProps {
    headerIconCls?: string;
    headerLabel?: string;
    pageVersion?: string;
    isShowLoader: boolean;
}

const removeExistingThemeClass = () => {
    document.body.classList.forEach((className) => {
        if (className.startsWith('theme-')) {
            document.body.classList.remove(className);
        }
    });
}
const addThemeClass = (_themeCls: string) => {
    removeExistingThemeClass();

    document.body.classList.add(_themeCls);
}

const PageHeader: React.FC<PageHeaderProps> = ({ headerIconCls, headerLabel, pageVersion, isShowLoader }) => {
    const [themeName, setThemeName] = useState(IMPORT_PAGE_THEMES[0]);

    const evtClickToggleTheme = () => {

        let themeIndex = IMPORT_PAGE_THEMES.indexOf(themeName);
        themeIndex = (themeIndex + 1) >= IMPORT_PAGE_THEMES.length ? 0 : (themeIndex + 1);
        setThemeName(IMPORT_PAGE_THEMES[themeIndex]);
    }

    useEffect(() => {
        addThemeClass(themeName);
    }, [themeName])

    return (
        <div className="comp-page-header font-black">
            <div className="header-top">
                <div className="header-logo-container">
                    <img src="/logo-small.png" alt="Logo" />
                </div>
                <div className="heading">
                    {headerIconCls && <i className={headerIconCls + "  heading-icon"}></i>}
                    <span>{headerLabel}</span>
                </div>
                <div className="header-right">
                    <div className="theme-toggle fas fa-adjust" onClick={evtClickToggleTheme} title="Change Theme">
                    </div>
                    <div className="page-version">{pageVersion}</div>
                </div>
            </div>
            <Loader isShow={isShowLoader} />
        </div>
    );
};

export default PageHeader;