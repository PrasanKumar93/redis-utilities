# testRedisConnection

## Request

```json
POST http://localhost:3001/api/testRedisConnection
{
"redisConUrl":"redis://localhost:6379"
}
```

## Response

```json
{
  "data": "Connection to Redis successful !",
  "error": null
}
```
