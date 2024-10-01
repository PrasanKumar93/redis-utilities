FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

ENV IMPORT_TOOL_FROM_DOCKER="Y"

CMD ["npm", "start"]