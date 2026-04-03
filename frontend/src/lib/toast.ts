import { toast } from 'sonner';
import { getErrorMessage } from './error-handling';
export function showErrorToast(message: string, options?: {duration?: number;}) {
  return toast.error(message, {
    duration: options?.duration || 5000
  });
}
export function showSuccessToast(message: string, options?: {duration?: number;}) {
  return toast.success(message, {
    duration: options?.duration || 3000
  });
}
export function showWarningToast(message: string, options?: {duration?: number;}) {
  return toast.warning(message, {
    duration: options?.duration || 4000
  });
}
export function showInfoToast(message: string, options?: {duration?: number;}) {
  return toast.info(message, {
    duration: options?.duration || 3000
  });
}
export function showErrorToastFromError(error: unknown, defaultMessage = 'An error occurred') {
  const message = getErrorMessage(error, defaultMessage);
  return showErrorToast(message);
}