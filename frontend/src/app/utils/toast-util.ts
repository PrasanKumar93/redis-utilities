import { toast, Bounce, ToastOptions } from "react-toastify";

//https://fkhadra.github.io/react-toastify/introduction/
const toastOptions: ToastOptions = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored", // light, dark, colored
  className: "",
  transition: Bounce,
};

const getOptions = (customOptions?: ToastOptions) => {
  let options = toastOptions;

  if (customOptions) {
    options = {
      ...toastOptions,
      ...customOptions,
    };
  }

  return options;
};

const errorToast = (message: string, customOptions?: ToastOptions) => {
  let options = getOptions(customOptions);
  toast.error(message, options);
};

const successToast = (message: string, customOptions?: ToastOptions) => {
  let options = getOptions(customOptions);
  toast.success(message, options);
};

const infoToast = (message: string, customOptions?: ToastOptions) => {
  let options = getOptions(customOptions);
  toast.info(message, options);
};

const warnToast = (message: string, customOptions?: ToastOptions) => {
  let options = getOptions(customOptions);
  toast.warn(message, options);
};

export { errorToast, successToast, infoToast, warnToast };
