# Redis Utilities

Utilities to support common redis operations like import, export, etc.

## Import Tool For Redis

## Setup

At project root, run the following commands:

```sh
# Install dependencies for frontend and backend
npm install

# Run the frontend and backend
npm run backend
npm run frontend
```

## (Optional) Backend environment variables

```env title="backend/import-tool/.env"
API_PORT=3001
ENCRYPTION_KEY=".......="
```

`openssl rand -base64 32` command in terminal to generate a new key

## (Optional) Frontend environment variables

```env title="frontend/.env"
NEXT_PUBLIC_ENCRYPTION_KEY=".......="
```

NEXT_PUBLIC_ENCRYPTION_KEY same as ENCRYPTION_KEY in backend

## API docs

- [Test Redis Connection](./docs/api/test-redis-connection.md)
- [Import Data to Redis](./docs/api/import-data-to-redis.md)
- [Resume Import Data to Redis](./docs/api/resume-import-data-to-redis.md)
- [Test JSON Formatter Function](./docs/api/test-json-formatter-fn.md)
- [Get Sample Input for JSON Formatter Function ](./docs/api/get-sample-input-for-json-formatter-fn.md)
