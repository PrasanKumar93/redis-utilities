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
docker run --rm --name redis-utilities -p 3000:3000 -p 3001:3001 prasanrajpurohit/redis-utilities:latest

docker run --rm --name redis-utilities --env PORT_FRONTEND=4500 --env PORT_BACKEND=4501  -p ${PORT_FRONTEND}:${PORT_FRONTEND} -p ${PORT_BACKEND}:${PORT_BACKEND} prasanrajpurohit/redis-utilities:latest

# Open http://localhost:3000/import after running above command, 3001 is backend port

# Login to docker hub ----------------
docker login

# Push to docker hub ----------------
docker push prasanrajpurohit/redis-utilities:latest
docker push prasanrajpurohit/redis-utilities:0.2.0
```
