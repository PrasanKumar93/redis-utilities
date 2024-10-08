# importDataToRedis

## Request

```json
POST http://localhost:3001/api/importDataToRedis
{
"redisConUrl":"redis://localhost:6379",
"redisConUrlEncrypted":{
  "encryptedData":"",
  "iv":"",
  "authTag":""
 },
"uploadType":"jsonFolder",
"uploadPath":"/Users/user1/Documents/data/product-data",
"keyPrefix":"products:",
"idField":"meta.requestId"
//,"socketId":"1"
//,"isStopOnError":true,
"jsFunctionString": "function formatter(jsonObj) { return jsonObj; }"
}
```

Note:

- `redisConUrl`: Redis connection URL.
  Either redisConUrl or redisConUrlEncrypted should be provided.

- [sample-upload-types](./sample-upload-types.md)
- Optional

  - `keyPrefix` : Prefix which will be added to the key in Redis.
  - `idField` : It is the field in the JSON file which will be used as the key in Redis.It can be nested field as well like `meta.details.productId`.
  - `socketId` : If provided, it will send the import process status to the client after processing each file.

  - `isStopOnError` : If true, it will stop the import process if any error occurs.
  - `jsFunctionString` : It is the JS function which will be used to format the JSON data before adding it to Redis.

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
