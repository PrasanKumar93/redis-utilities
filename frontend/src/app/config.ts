import { fetchServerVariables } from "./utils/axios-util";

interface IConfig {
  data: {
    FROM_DOCKER?: string;
    DEFAULT_REDIS_URL?: string;
    GIT_TAG?: string;
    API_BASE_URL?: string;
    SOCKET_IO_URL?: string;
    ENCRYPTION_KEY?: string;
  };
}

const config: IConfig = {
  data: {},
};

const setConfigData = async () => {
  const serverVars: any = await fetchServerVariables();
  if (serverVars) {
    const ENV_VARS = {
      PORT_BACKEND: serverVars.PORT_BACKEND || 3001,
      PORT_FRONTEND: serverVars.PORT_FRONTEND || 3000,
      ENCRYPTION_KEY: serverVars.IMPORT_TOOL_ENCRYPTION_KEY || "",
      FROM_DOCKER: serverVars.IMPORT_TOOL_FROM_DOCKER || "N",
    };

    config.data = {
      FROM_DOCKER: ENV_VARS.FROM_DOCKER,
      DEFAULT_REDIS_URL:
        ENV_VARS.FROM_DOCKER === "Y"
          ? "redis://host.docker.internal:6379"
          : "redis://localhost:6379",
      GIT_TAG: "v0.3.0",
      API_BASE_URL: `http://localhost:${ENV_VARS.PORT_BACKEND}/api`,
      SOCKET_IO_URL: `http://localhost:${ENV_VARS.PORT_BACKEND}/`,
      ENCRYPTION_KEY: ENV_VARS.ENCRYPTION_KEY,
    };
  }

  return config.data;
};

const getConfigData = () => {
  return config.data;
};

export { getConfigData, setConfigData };
