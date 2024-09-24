const IMPORT_ANIMATE_CSS = {
  CHOOSE_UPLOAD_PATH: "choose-upload-path",
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
const UPLOAD_CATEGORY = {
  SERVER_PATH: "SERVER_PATH",
  BROWSER_UPLOAD: "BROWSER_UPLOAD",
};

const UPLOAD_DROPDOWN_OPTIONS = [
  {
    value: "1",
    label: "JSON Folder (Server Path)",
    placeholder: "/Users/tom/Documents/product-data",
    category: UPLOAD_CATEGORY.SERVER_PATH,
    uploadType: UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER,
  },
  {
    value: "2",
    label: "JSON Array File (Server Path)",
    placeholder: "/Users/tom/Documents/product-data/products.json",
    category: UPLOAD_CATEGORY.SERVER_PATH,
    uploadType: UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE,
  },
  {
    value: "3",
    label: "CSV File (Server Path)",
    placeholder: "/Users/tom/Documents/product-data/products.csv",
    category: UPLOAD_CATEGORY.SERVER_PATH,
    uploadType: UPLOAD_TYPES_FOR_IMPORT.CSV_FILE,
  },
  {
    value: "4",
    label: "JSON Array File Upload",
    placeholder: "products.json",
    category: UPLOAD_CATEGORY.BROWSER_UPLOAD,
    uploadType: UPLOAD_TYPES_FOR_IMPORT.JSON_ARRAY_FILE,
    allowExtension: ".json",
  },
  {
    value: "5",
    label: "CSV File Upload",
    placeholder: "products.csv",
    category: UPLOAD_CATEGORY.BROWSER_UPLOAD,
    uploadType: UPLOAD_TYPES_FOR_IMPORT.CSV_FILE,
    allowExtension: ".csv",
  },
  {
    value: "6",
    label: "(Zipped) JSON Folder Upload",
    placeholder: "products.zip",
    category: UPLOAD_CATEGORY.BROWSER_UPLOAD,
    uploadType: UPLOAD_TYPES_FOR_IMPORT.JSON_FOLDER,
    allowExtension: ".zip",
  },
];

export {
  IMPORT_ANIMATE_CSS,
  IMPORT_STATUS,
  IMPORT_PAGE_TABS,
  IMPORT_PAGE_THEMES,
  UPLOAD_DROPDOWN_OPTIONS,
  UPLOAD_TYPES_FOR_IMPORT,
  UPLOAD_CATEGORY,
};
