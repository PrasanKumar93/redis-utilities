# uploadFileForImportDataToRedis

## Request

```json
POST http://localhost:3001/api/uploadFileForImportDataToRedis
FormData {
"uploadType":"csvFile",
"socketId":"",
"file":"binaryContent"
}
```

## Response

```json
{
  "data": {
    "serverUploadPath": "/Users/.../ecommerce_products.csv",
    "message": "File uploaded successfully !"
  },
  "error": null
}
```
