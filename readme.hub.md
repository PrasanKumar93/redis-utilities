## Sample Dockerhub flow for redis-utilities

```sh

# Build image ----------------
docker-compose -f docker-compose.hub.yml build

# Run and test local image ----------------
docker-compose -f docker-compose.hub.yml up -d
docker-compose -f docker-compose.hub.yml down

# Tag new local image ----------------
docker tag redis-utilities-local:latest prasanrajpurohit/redis-utilities:latest
docker tag redis-utilities-local:latest prasanrajpurohit/redis-utilities:0.2.0

# Test tagged image ----------------
# Open http://localhost:3000/import after running below command
docker run --rm --name redis-utilities -p 3000:3000 prasanrajpurohit/redis-utilities:latest

# Open http://localhost:4000/import after running below command
docker run --rm --name redis-utilities -p 4000:4000 -p 3005:3005  --env-file ./.env prasanrajpurohit/redis-utilities:latest

# Login to docker hub ----------------
docker login

# Push to docker hub ----------------
docker push prasanrajpurohit/redis-utilities:latest
docker push prasanrajpurohit/redis-utilities:0.2.0
```
