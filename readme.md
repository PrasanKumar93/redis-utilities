# Redis Utilities

Utilities to support common redis operations.

## Import Tool For Redis

### Start application

```sh
# to start docker app
docker compose up -d
```

- Open **http://localhost:4000/import** in browser

### Other commands

```sh
# to stop docker app
docker compose down

# to stop & also delete volumes (mongodb & redis data)
docker compose down -v

# to rebuild all images & start
docker compose  up -d --build

# to rebuild image of specific service (after any code changes)
docker-compose build --no-cache <service_name>
# example
docker-compose build --no-cache import-tool-service
docker-compose build --no-cache frontend
```

## (Optional) environment variables

Can modify the environment variables in the **.env** file.

```sh title="./.env"
# Common
PORT_BACKEND=3001
PORT_FRONTEND=3000

# Backend
IMPORT_TOOL_ENCRYPTION_KEY="4JxqtKVmjA/AV+UrRADgeRO0NKiOGHxAxEhs84BGWsQ="

# Frontend
NEXT_PUBLIC_ENCRYPTION_KEY="4JxqtKVmjA/AV+UrRADgeRO0NKiOGHxAxEhs84BGWsQ="
# Note: Frontend encryption key is same as backend
```

Note :

- One way to generate an encryption key is by using the `openssl rand -base64 32` command in the terminal.

## API docs

- [Test Redis Connection](./docs/api/test-redis-connection.md)
- [Import Data to Redis](./docs/api/import-data-to-redis.md)
- [Resume Import Data to Redis](./docs/api/resume-import-data-to-redis.md)
- [Test JSON Formatter Function](./docs/api/test-json-formatter-fn.md)
- [Get Sample Input for JSON Formatter Function ](./docs/api/get-sample-input-for-json-formatter-fn.md)
