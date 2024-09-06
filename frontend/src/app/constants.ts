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
  "theme-redis",
  "theme-blue",
  "theme-blue-gray",
  "theme-teal",
  "theme-orange",
  "theme-brown",
  "theme-gray",
];

const UPLOAD_TYPES_FOR_IMPORT = {
  JSON_FOLDER: "jsonFolder",
  JSON_ARRAY_FILE: "jsonArrayFile",
  CSV_FILE: "csvFile",
};

const UPLOAD_TYPES_OPTIONS = [
  {
    value: UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER,
    label: "JSON Folder",
    placeholder: "/Users/tom/Documents/product-data",
  },
  {
    value: UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE,
    label: "JSON Array File",
    placeholder: "/Users/tom/Documents/product-data/products.json",
  },
  // {
  //   value: UPLOAD_TYPES_FOR_IMPORT.CSV_FILE,
  //   label: "CSV File",
  //   placeholder: "/Users/tom/Documents/product-data/products.csv",
  // },
];

export {
  IMPORT_ANIMATE_CSS,
  IMPORT_STATUS,
  IMPORT_PAGE_TABS,
  IMPORT_PAGE_THEMES,
  UPLOAD_TYPES_OPTIONS,
  UPLOAD_TYPES_FOR_IMPORT,
};
