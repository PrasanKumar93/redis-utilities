const config = {
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api",
  SOCKET_IO_URL:
    process.env.NEXT_PUBLIC_SOCKET_IO_URL || "http://localhost:3001/",
  DEFAULT_REDIS_URL:
    process.env.NEXT_PUBLIC_DEFAULT_REDIS_URL || "redis://localhost:6379",
  GIT_TAG: "v0.2.0",
};

export { config };
