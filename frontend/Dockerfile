FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run build

ENV IMPORT_TOOL_FROM_DOCKER="Y"

# CMD is runtime instruction, so can use ENV variable 
CMD npm start -- -p $PORT_FRONTEND
