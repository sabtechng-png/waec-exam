import { enqueueSnackbar } from "notistack";

export default function notify(message, variant = "success") {
  enqueueSnackbar(message, { variant });
}
