import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/lib/error-handling';
import { showErrorToastFromError } from '@/lib/toast';

interface UseActionErrorOptions {
  showToast?: boolean;
  showInline?: boolean;
  defaultMessage?: string;
}

interface ActionError {
  message: string | null;
  clear: () => void;
  handleError: (error: unknown) => void;
}

export function useActionError({
  showToast = true,
  showInline = false,
  defaultMessage = 'An error occurred'
}: UseActionErrorOptions = {}): ActionError {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = useCallback((error: unknown) => {
    const message = getErrorMessage(error, defaultMessage);

    if (showToast) {
      showErrorToastFromError(error, defaultMessage);
    }

    if (showInline) {
      setErrorMessage(message);
    }


    if (import.meta.env.DEV) {
      console.error('Action error:', error);
    }
  }, [showToast, showInline, defaultMessage]);

  const clear = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    message: errorMessage,
    clear,
    handleError
  };
}