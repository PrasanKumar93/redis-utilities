import axios, {
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

import { errorToast } from "./toast-util";
import { config } from "../config";

interface IApiResponse {
  data: any;
  error: any;
}
const CSS_CLASSES = {
  CUSTOM_ERROR_TOAST: "custom-error-toast",
};

// #region helper functions
const consoleLogError = (axiosError: any) => {
  const error = axiosError?.response?.data?.error || axiosError;
  if (error) {
    console.error(error);
  }
  return error;
};

const errorAPIAlert = (apiName: string) => {
  if (!apiName.startsWith("/")) {
    apiName = `/${apiName}`;
  }
  errorToast(`Error in ${apiName} API, Check console for more info !`, {
    className: CSS_CLASSES.CUSTOM_ERROR_TOAST,
  });
};
// #endregion

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
});

const getRequest = async (
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<IApiResponse>> => {
  try {
    const response = await axiosInstance.get(url, config);
    return response;
  } catch (error) {
    console.error("getRequest error:", url, error);
    throw error;
  }
};

const postRequest = async (
  url: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<IApiResponse>> => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return response;
  } catch (error) {
    console.error("postRequest error:", url, error);
    throw error;
  }
};

const fileUploadRequest = async (
  url: string,
  formData: any,
  config?: AxiosRequestConfig | null,
  uploadProgressCallback?: (progress: number) => void
): Promise<AxiosResponse<IApiResponse>> => {
  try {
    if (!config) {
      config = {};
    }

    if (!config.headers) {
      config.headers = {};
    }

    config.headers["Content-Type"] = "multipart/form-data";

    if (uploadProgressCallback) {
      config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const progressPercentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          uploadProgressCallback(progressPercentage);
        }
      };
    }
    const response = await axiosInstance.post(url, formData, config);
    return response;
  } catch (error) {
    console.error("fileUploadRequest error:", url, error);
    throw error;
  }
};

export {
  getRequest,
  postRequest,
  fileUploadRequest,
  consoleLogError,
  errorAPIAlert,
};
