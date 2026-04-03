import { AxiosError } from 'axios';
import { UseMutationResult } from '@tanstack/react-query';

export function createAxiosError(
status: number,
message: string,
data?: any)
: AxiosError {
  const error = new Error(message) as AxiosError;
  error.response = {
    status,
    statusText: getStatusText(status),
    data: data || { message },
    headers: {},
    config: {} as any
  };
  error.isAxiosError = true;
  error.config = {} as any;
  return error;
}

export function createValidationError(fieldErrors: Record<string, string>): AxiosError {
  return createAxiosError(400, 'Validation failed', {
    message: 'Validation failed',
    errors: fieldErrors
  });
}


export function createNetworkError(message = 'Network Error'): AxiosError {
  const error = new Error(message) as AxiosError;
  error.isAxiosError = true;
  error.config = {} as any;
  return error;
}


export function createServerError(
status: number = 500,
message: string = 'Internal Server Error')
: AxiosError {
  return createAxiosError(status, message);
}


export function createAuthError(message: string = 'Unauthorized'): AxiosError {
  return createAxiosError(401, message);
}


export function createPermissionError(message: string = 'Forbidden'): AxiosError {
  return createAxiosError(403, message);
}


export function createNotFoundError(message: string = 'Not Found'): AxiosError {
  return createAxiosError(404, message);
}


function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  return statusTexts[status] || 'Unknown Error';
}


export function createMockMutationWithError<TData = any, TError = Error, TVariables = any>(
error: TError,
options: Partial<UseMutationResult<TData, TError, TVariables, unknown>> = {})
: UseMutationResult<TData, TError, TVariables, unknown> {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockRejectedValue(error),
    reset: jest.fn(),
    context: undefined,
    data: undefined,
    error,
    failureCount: 1,
    failureReason: error,
    isError: true,
    isIdle: false,
    isPending: false,
    isPaused: false,
    isSuccess: false,
    status: 'error',
    submittedAt: Date.now(),
    variables: undefined,
    ...options
  } as UseMutationResult<TData, TError, TVariables, unknown>;
}


export function createMockMutationWithSuccess<TData = any, TError = Error, TVariables = any>(
data: TData,
options: Partial<UseMutationResult<TData, TError, TVariables, unknown>> = {})
: UseMutationResult<TData, TError, TVariables, unknown> {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue(data),
    reset: jest.fn(),
    context: undefined,
    data,
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isIdle: false,
    isPending: false,
    isPaused: false,
    isSuccess: true,
    status: 'success',
    submittedAt: Date.now(),
    variables: undefined,
    ...options
  } as UseMutationResult<TData, TError, TVariables, unknown>;
}


export function createMockMutationPending<TData = any, TError = Error, TVariables = any>(
options: Partial<UseMutationResult<TData, TError, TVariables, unknown>> = {})
: UseMutationResult<TData, TError, TVariables, unknown> {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    reset: jest.fn(),
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isIdle: false,
    isPending: true,
    isPaused: false,
    isSuccess: false,
    status: 'pending',
    submittedAt: Date.now(),
    variables: undefined,
    ...options
  } as UseMutationResult<TData, TError, TVariables, unknown>;
}


export function createMockMutationIdle<TData = any, TError = Error, TVariables = any>(
options: Partial<UseMutationResult<TData, TError, TVariables, unknown>> = {})
: UseMutationResult<TData, TError, TVariables, unknown> {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    reset: jest.fn(),
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isIdle: true,
    isPending: false,
    isPaused: false,
    isSuccess: false,
    status: 'idle',
    submittedAt: undefined,
    variables: undefined,
    ...options
  } as UseMutationResult<TData, TError, TVariables, unknown>;
}