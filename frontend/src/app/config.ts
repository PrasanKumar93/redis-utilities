const ENV_VARS = {
  PORT_BACKEND: process.env.NEXT_PUBLIC_PORT_BACKEND || 3001,
  FROM_DOCKER: process.env.NEXT_PUBLIC_FROM_DOCKER || "N",
};

const config = {
  FROM_DOCKER: ENV_VARS.FROM_DOCKER,
  DEFAULT_REDIS_URL:
    ENV_VARS.FROM_DOCKER === "Y"
      ? "redis://host.docker.internal:6379"
      : "redis://localhost:6379",
  GIT_TAG: "v0.3.0",
  API_BASE_URL: `http://localhost:${ENV_VARS.PORT_BACKEND}/api`,
  SOCKET_IO_URL: `http://localhost:${ENV_VARS.PORT_BACKEND}/`,
};

export { config };
