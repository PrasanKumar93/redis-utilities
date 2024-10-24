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

docker run --rm --name redis-utilities --env PORT_FRONTEND=4500 --env PORT_BACKEND=4501  -p 4500:4500 -p 4501:4501 prasanrajpurohit/redis-utilities:latest

# Open http://localhost:3000/import after running above command, 3001 is backend port

# Login to docker hub ----------------
docker login

# Push to docker hub ----------------
docker push prasanrajpurohit/redis-utilities:latest
docker push prasanrajpurohit/redis-utilities:0.2.0
```

## Heroku flow for redis-utilities

```sh
# first time setup
brew tap heroku/brew && brew install heroku  # For macOS

heroku login # web login
heroku create redis-utilities # or create a new app `redis-utilities` by dashboard

# informing Heroku that your app should be run using the container stack
heroku stack:set container -a redis-utilities
```

```sh
heroku container:login

# Tag & Push the image to Heroku (appName/web):
docker tag redis-utilities-amd64:latest registry.heroku.com/redis-utilities/web
docker push registry.heroku.com/redis-utilities/web

# Release the image
heroku container:release web -a redis-utilities

# Just restart the app
heroku restart -a redis-utilities
heroku ps -a redis-utilities

```
