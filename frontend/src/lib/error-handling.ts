import { AxiosError } from "axios";
export type ErrorCategory =
'network' |
'auth' |
'permission' |
'notFound' |
'validation' |
'server' |
'client' |
'unknown';
export interface CategorizedError {
  category: ErrorCategory;
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
  retryable: boolean;
}
export function isForbiddenError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 403;
}
export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}
export function isNotFoundError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 404;
}
export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status === 400 || status === 422;
  }
  return false;
}
export function categorizeError(error: unknown): CategorizedError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      return {
        category: 'auth',
        message: message || 'Authentication required',
        status: 401,
        retryable: false
      };
    }

    if (status === 403) {
      return {
        category: 'permission',
        message: message || 'You don\'t have permission to perform this action',
        status: 403,
        retryable: false
      };
    }

    if (status === 404) {
      return {
        category: 'notFound',
        message: message || 'Resource not found',
        status: 404,
        retryable: false
      };
    }

    if (status === 400 || status === 422) {
      return {
        category: 'validation',
        message: message || 'Validation error',
        status,
        fieldErrors: error.response?.data?.errors || {},
        retryable: false
      };
    }

    if (status && status >= 500) {
      return {
        category: 'server',
        message: message || 'Server error',
        status,
        retryable: true
      };
    }

    if (!error.response) {
      return {
        category: 'network',
        message: 'Network error. Please check your connection.',
        retryable: true
      };
    }
  }

  if (error instanceof Error) {
    return {
      category: 'client',
      message: error.message,
      retryable: false
    };
  }

  return {
    category: 'unknown',
    message: 'An unexpected error occurred',
    retryable: false
  };
}
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof AxiosError) {
    if (error.response?.status === 403) {
      return error.response?.data?.message || 'You don\'t have permission to perform this action';
    }
    if (error.response?.status === 401) {
      return error.response?.data?.message || 'Authentication required';
    }
    if (error.response?.status === 404) {
      return error.response?.data?.message || 'Resource not found';
    }
    return error.response?.data?.message || error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}
export function shouldShow403Page(context: 'route' | 'list' | 'form' | 'picker'): boolean {

  return context === 'route';
}