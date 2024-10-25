#-------------------builderImportTool-------------------------
FROM node:18-alpine AS builderImportTool

WORKDIR /app

# Copy the package.json and install dependencies 
COPY package*.json ./backend/import-tool/
RUN cd ./backend/import-tool && npm install

# Copy the rest of the code
COPY . ./backend/import-tool

# Build the code
RUN cd ./backend/import-tool && npm run build 

#-------------------Final stage-------------------------
FROM node:18-alpine

WORKDIR /app

# Copy required files from the build stage
COPY --from=builderImportTool /app/backend/import-tool/package*.json ./backend/import-tool/
COPY --from=builderImportTool /app/backend/import-tool/dist ./backend/import-tool/dist

# Install only production dependencies 
RUN cd ./backend/import-tool && npm ci --only=production

# Set environment variables
ENV IMPORT_TOOL_FROM_DOCKER="Y"

# Start app
CMD ["sh", "-c", "cd /app/backend/import-tool && npm run start-prod"]

