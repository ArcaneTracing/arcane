import type { AxiosError } from 'axios';

export class ArcanApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly requestId?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ArcanApiError';
    Object.setPrototypeOf(this, ArcanApiError.prototype);
  }

  static fromAxiosError(err: AxiosError<{ message?: string }>): ArcanApiError {
    const status = err.response?.status;
    const message =
      err.response?.data?.message ??
      err.message ??
      err.response?.statusText ??
      'Unknown API error';
    const requestId = err.response?.headers?.['x-request-id'] as string | undefined;
    return new ArcanApiError(message, status, requestId, err);
  }
}

export class ArcanNotFoundError extends ArcanApiError {
  constructor(message: string, requestId?: string) {
    super(message, 404, requestId);
    this.name = 'ArcanNotFoundError';
  }
}

export class ArcanUnauthorizedError extends ArcanApiError {
  constructor(message: string, requestId?: string) {
    super(message, 401, requestId);
    this.name = 'ArcanUnauthorizedError';
  }
}
