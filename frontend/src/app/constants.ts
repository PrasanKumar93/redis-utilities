const IMPORT_ANIMATE_CSS = {
  CHOOSE_FOLDER_PATH: "choose-folder-path",
  SHOW_IMPORT_PROCESS_CTR: "show-import-process-ctr",
  IMPORT_START: "import-start",
  IMPORT_PAUSE: "import-pause",
  IMPORT_ERROR: "import-error",
  IMPORT_COMPLETE: "import-complete",
};

enum IMPORT_STATUS {
  IN_PROGRESS = "inProgress",
  ERROR_STOPPED = "errorStopped",
  PAUSED = "paused",
  SUCCESS = "success",
  PARTIAL_SUCCESS = "partialSuccess",
}

enum IMPORT_PAGE_TABS {
  LOGS = 0,
  ERRORS = 1,
}

const IMPORT_PAGE_THEMES = [
  "theme-blue",
  "theme-blue-gray",
  "theme-teal",
  "theme-orange",
  "theme-gray",
  "theme-brown",
];

export {
  IMPORT_ANIMATE_CSS,
  IMPORT_STATUS,
  IMPORT_PAGE_TABS,
  IMPORT_PAGE_THEMES,
};
