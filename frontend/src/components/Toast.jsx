import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const options = {
  position: "top-center",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
};

// Functions
const Toast = {
  success: (msg) => toast.success(msg, options),
  error: (msg) => toast.error(msg, options),
  info: (msg) => toast.info(msg, options),
  warn: (msg) => toast.warn(msg, options),
};

export default Toast;
