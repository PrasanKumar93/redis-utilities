- `uploadType` can be one of the following:

```ts
const UPLOAD_TYPES_FOR_IMPORT = {
  JSON_FOLDER: "jsonFolder",
  JSON_ARRAY_FILE: "jsonArrayFile",
  CSV_FILE: "csvFile",
};
```

- `uploadPath` can be absolute path of disk or relative path in the repo.

```ts
const SAMPLE_UPLOAD_PATHS = {
  JSON_FOLDER: "/Users/user1/Documents/data/product-data",
  JSON_ARRAY_FILE: "/Users/user1/Documents/data/products.json",
  CSV_FILE: "/Users/user1/Documents/data/products.csv",
};
```
