# importFilesToRedis

## Request

```json
POST http://localhost:3001/api/importFilesToRedis
{
"redisConUrl":"redis://localhost:6379",
"serverFolderPath":"/Users/user1/Documents/data/product-data",
"keyPrefix":"products:",
"idField":"meta.requestId"
//,"socketId":""
}
```

Note:

- `redisConUrl`: Redis connection URL.
- `serverFolderPath` can be absolute path of disk or relative path in the repo.
- Optional
  - `keyPrefix` : Prefix which will be added to the key in Redis.
  - `idField` : It is the field in the JSON file which will be used as the key in Redis.It can be nested field as well like `meta.details.productId`.

## Response (without socketId)

```json
{
  "data": {
    "stats": {
      "totalFiles": 44446,
      "processed": 44446,
      "failed": 0,
      "startTimeInMs": 139147.621459,
      "endTimeInMs": 242719.762542,
      "totalTimeInMs": 103572.14108300002
    },
    "fileErrors": []
  },
  "error": null
}
```

## Response (from browser with socketId)

```json
{
  "data": {
    "message": "Importing files to Redis started !"
  },
  "error": null
}
```

Note: check `console logs` or `RedisInsight` or `application UI` for data import status.
