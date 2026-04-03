import { useEffect, useRef } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useActionError } from './use-action-error';
import { showSuccessToast } from '@/lib/toast';

interface UseMutationActionOptions {
  mutation: UseMutationResult<any, unknown, any, unknown>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  showErrorToast?: boolean;
  successMessage?: string;
}

export function useMutationAction({
  mutation,
  onSuccess,
  onError,
  showErrorToast = true,
  successMessage
}: UseMutationActionOptions) {
  const actionError = useActionError({ showToast: showErrorToast });
  const successHandledRef = useRef(false);
  const errorHandledRef = useRef(false);


  useEffect(() => {
    if (mutation.isIdle || mutation.isPending) {
      successHandledRef.current = false;
      errorHandledRef.current = false;
    }
  }, [mutation.isIdle, mutation.isPending]);


  useEffect(() => {
    if (mutation.isSuccess && !successHandledRef.current) {
      successHandledRef.current = true;
      if (successMessage) {
        showSuccessToast(successMessage);
      }
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [mutation.isSuccess, successMessage, onSuccess]);


  useEffect(() => {
    if (mutation.isError && mutation.error && !errorHandledRef.current) {
      errorHandledRef.current = true;
      if (onError) {
        onError(mutation.error);
      } else {
        actionError.handleError(mutation.error);
      }
    }
  }, [mutation.isError, mutation.error, onError, actionError]);

  return {
    ...mutation,
    errorMessage: actionError.message,
    clearError: actionError.clear
  };
}