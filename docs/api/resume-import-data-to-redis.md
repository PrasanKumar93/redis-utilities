# resumeImportDataToRedis

## Request

```json
POST http://localhost:3001/api/resumeImportDataToRedis
{
"socketId":"1",
"isStopOnError":true,
"uploadType":"jsonFolder",
"uploadPath":"/Users/user1/Documents/data/product-data",
}
```

Note:

- [sample-upload-types](./sample-upload-types.md)
- `socketId` : To resume the import process of connected socket client.

- Optional
  - `isStopOnError` : If true, it will stop the import process if any error occurs.

## Response

```json
{
  "data": {
    "stats": {
      "totalFiles": 44446,
      "processed": 44445,
      "failed": 1,
      "totalTimeInMs": 103572
    },
    "importErrors": [
      {
        "filePath": "...",
        "error": "..."
      }
    ]
  },
  "error": null
}
```

Note: check `console logs` or `RedisInsight` or `application UI` for file import status.
