# testRedisConnection

## Request

```json
POST http://localhost:3001/api/testRedisConnection
{
"redisConUrl":"redis://localhost:6379",
"redisConUrlEncrypted":{
  "encryptedData":"",
  "iv":"",
  "authTag":""
 }
}
```

Note : Either redisConUrl or redisConUrlEncrypted should be provided.

## Response

```json
{
  "data": "Connection to Redis successful !",
  "error": null
}
```
