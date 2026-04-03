import { useState, useRef, useEffect } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { getErrorMessage, isForbiddenError, isValidationError } from '@/lib/error-handling';
import { AxiosError } from 'axios';

interface UseFormErrorsOptions {
  mutation: UseMutationResult<any, unknown, any, unknown>;
  resetOnOpen?: boolean;
  onError?: (error: unknown) => void;
}

interface FormErrors {
  general: string | null;
  fieldErrors: Record<string, string>;
  isForbidden: boolean;
  isValidation: boolean;
  clear: () => void;
  clearField: (fieldName: string) => void;
}

export function useFormErrors({
  mutation,
  resetOnOpen = true,
  onError
}: UseFormErrorsOptions): FormErrors {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const errorWhenOpenedRef = useRef<string | null>(null);
  const prevOpenRef = useRef(false);


  const mutationError = mutation.error;
  const errorMessage = mutationError ?
  getErrorMessage(mutationError, 'An error occurred') :
  null;


  useEffect(() => {
    if (resetOnOpen && !prevOpenRef.current) {
      errorWhenOpenedRef.current = errorMessage;
    }
    prevOpenRef.current = true;
  }, [errorMessage, resetOnOpen]);


  const shouldShowError = errorMessage !== null && (
  !resetOnOpen || errorMessage !== errorWhenOpenedRef.current);


  useEffect(() => {
    if (mutationError && isValidationError(mutationError)) {
      const axiosError = mutationError as AxiosError;
      const validationErrors = axiosError?.response?.data?.errors || {};
      setFieldErrors(validationErrors);
    } else {
      setFieldErrors({});
    }
  }, [mutationError]);


  useEffect(() => {
    if (mutationError && onError) {
      onError(mutationError);
    }
  }, [mutationError, onError]);

  return {
    general: shouldShowError ? errorMessage : null,
    fieldErrors,
    isForbidden: mutationError ? isForbiddenError(mutationError) : false,
    isValidation: mutationError ? isValidationError(mutationError) : false,
    clear: () => {
      mutation.reset();
      setFieldErrors({});
      errorWhenOpenedRef.current = null;
    },
    clearField: (fieldName: string) => {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };
}