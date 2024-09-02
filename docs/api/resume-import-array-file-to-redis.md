# resumeImportArrayFileToRedis

## Request

```json
POST http://localhost:3001/api/resumeImportArrayFileToRedis
{
"socketId":"1",
"isStopOnError":true
}
```

Note:

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
