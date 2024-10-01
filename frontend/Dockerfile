FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

ARG NEXT_PUBLIC_ENCRYPTION_KEY_ARG
ARG NEXT_PUBLIC_PORT_BACKEND_ARG

# Set environment variables as next js static build requires them
ENV NEXT_PUBLIC_ENCRYPTION_KEY=${NEXT_PUBLIC_ENCRYPTION_KEY_ARG}
ENV NEXT_PUBLIC_PORT_BACKEND=${NEXT_PUBLIC_PORT_BACKEND_ARG}
ENV NEXT_PUBLIC_FROM_DOCKER="Y"

RUN npm run build

# CMD is runtime instruction, so can use ENV variable rather than ARG variable
CMD npm start -- -p $PORT_FRONTEND
