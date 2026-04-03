import { AxiosError } from 'axios';
import {
  isForbiddenError,
  isUnauthorizedError,
  isNotFoundError,
  isValidationError,
  categorizeError,
  getErrorMessage,
  shouldShow403Page,
} from '../error-handling';

function createAxiosError(status: number, data?: Record<string, unknown>) {
  const error = new AxiosError(`Status ${status}`);
  error.response = {
    status,
    statusText: 'Error',
    data: data ?? {},
    headers: {},
    config: {} as any,
  };
  return error;
}

describe('error-handling utilities', () => {
  describe('isForbiddenError', () => {
    it('should return true for 403 AxiosError', () => {
      const error = new AxiosError('Forbidden');
      error.response = {
        status: 403,
        statusText: 'Forbidden',
        data: {},
        headers: {},
        config: {} as any,
      };
      expect(isForbiddenError(error)).toBe(true);
    });

    it('should return false for 401 AxiosError', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
        headers: {},
        config: {} as any,
      };
      expect(isForbiddenError(error)).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      const error = new Error('Some error');
      expect(isForbiddenError(error)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isForbiddenError(null)).toBe(false);
      expect(isForbiddenError(undefined)).toBe(false);
    });
  });

  describe('isUnauthorizedError', () => {
    it('should return true for 401 AxiosError', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
        headers: {},
        config: {} as any,
      };
      expect(isUnauthorizedError(error)).toBe(true);
    });

    it('should return false for 403 AxiosError', () => {
      const error = new AxiosError('Forbidden');
      error.response = {
        status: 403,
        statusText: 'Forbidden',
        data: {},
        headers: {},
        config: {} as any,
      };
      expect(isUnauthorizedError(error)).toBe(false);
    });
  });

  describe('isNotFoundError', () => {
    it('should return true for 404 AxiosError', () => {
      const error = createAxiosError(404);
      expect(isNotFoundError(error)).toBe(true);
    });
  });

  describe('isValidationError', () => {
    it('should return true for 400 AxiosError', () => {
      expect(isValidationError(createAxiosError(400))).toBe(true);
    });

    it('should return true for 422 AxiosError', () => {
      expect(isValidationError(createAxiosError(422))).toBe(true);
    });

    it('should return false for 401 AxiosError', () => {
      expect(isValidationError(createAxiosError(401))).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      expect(isValidationError(new Error('test'))).toBe(false);
    });
  });

  describe('categorizeError', () => {
    it('should categorize 401 as auth', () => {
      const result = categorizeError(createAxiosError(401));
      expect(result.category).toBe('auth');
      expect(result.status).toBe(401);
      expect(result.retryable).toBe(false);
    });

    it('should categorize 403 as permission', () => {
      const result = categorizeError(createAxiosError(403));
      expect(result.category).toBe('permission');
      expect(result.status).toBe(403);
    });

    it('should categorize 404 as notFound', () => {
      const result = categorizeError(createAxiosError(404));
      expect(result.category).toBe('notFound');
      expect(result.status).toBe(404);
    });

    it('should categorize 400 as validation with fieldErrors', () => {
      const error = createAxiosError(400, { errors: { field1: 'Invalid' } });
      const result = categorizeError(error);
      expect(result.category).toBe('validation');
      expect(result.fieldErrors).toEqual({ field1: 'Invalid' });
    });

    it('should categorize 500 as server and retryable', () => {
      const result = categorizeError(createAxiosError(500));
      expect(result.category).toBe('server');
      expect(result.retryable).toBe(true);
    });

    it('should categorize network error when no response', () => {
      const error = new AxiosError('Network Error');
      error.response = undefined;
      const result = categorizeError(error);
      expect(result.category).toBe('network');
      expect(result.retryable).toBe(true);
    });

    it('should categorize generic Error as client', () => {
      const result = categorizeError(new Error('Something broke'));
      expect(result.category).toBe('client');
      expect(result.message).toBe('Something broke');
    });

    it('should categorize unknown as unknown', () => {
      const result = categorizeError('string error');
      expect(result.category).toBe('unknown');
      expect(result.message).toBe('An unexpected error occurred');
    });
  });

  describe('getErrorMessage', () => {
    it('should return custom message for 403 error', () => {
      const error = new AxiosError('Forbidden');
      error.response = {
        status: 403,
        statusText: 'Forbidden',
        data: { message: 'Custom forbidden message' },
        headers: {},
        config: {} as any,
      };
      expect(getErrorMessage(error, 'Default')).toBe('Custom forbidden message');
    });

    it('should return default 403 message when no custom message', () => {
      const error = new AxiosError('Forbidden');
      error.response = {
        status: 403,
        statusText: 'Forbidden',
        data: {},
        headers: {},
        config: {} as any,
      };
      expect(getErrorMessage(error, 'Default')).toBe("You don't have permission to perform this action");
    });

    it('should return custom message for 401 error', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: { message: 'Custom auth message' },
        headers: {},
        config: {} as any,
      };
      expect(getErrorMessage(error, 'Default')).toBe('Custom auth message');
    });

    it('should return default 401 message when no custom message', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
        headers: {},
        config: {} as any,
      };
      expect(getErrorMessage(error, 'Default')).toBe('Authentication required');
    });

    it('should return custom message for 404 error', () => {
      const error = new AxiosError('Not Found');
      error.response = {
        status: 404,
        statusText: 'Not Found',
        data: { message: 'Resource not found' },
        headers: {},
        config: {} as any,
      };
      expect(getErrorMessage(error, 'Default')).toBe('Resource not found');
    });

    it('should return error message for non-AxiosError', () => {
      const error = new Error('Custom error message');
      expect(getErrorMessage(error, 'Default')).toBe('Custom error message');
    });

    it('should return default message for unknown error type', () => {
      expect(getErrorMessage('string error', 'Default')).toBe('Default');
      expect(getErrorMessage(null, 'Default')).toBe('Default');
    });

    it('should return data message for 400 error', () => {
      const error = createAxiosError(400, { message: 'Bad request message' });
      expect(getErrorMessage(error, 'Default')).toBe('Bad request message');
    });

    it('should return error.message when no data message for non-403/401/404', () => {
      const error = createAxiosError(500);
      error.message = 'Internal server error';
      expect(getErrorMessage(error, 'Default')).toBe('Internal server error');
    });

    it('should return data.message for 500 when present', () => {
      const error = createAxiosError(500, { message: 'Server overloaded' });
      expect(getErrorMessage(error, 'Default')).toBe('Server overloaded');
    });

    it('should return defaultMessage when AxiosError has empty response.data and no message', () => {
      const error = createAxiosError(500, {});
      error.message = '';
      expect(getErrorMessage(error, 'Fallback message')).toBe('Fallback message');
    });
  });

  describe('shouldShow403Page', () => {
    it('should return true for route context', () => {
      expect(shouldShow403Page('route')).toBe(true);
    });

    it('should return false for list context', () => {
      expect(shouldShow403Page('list')).toBe(false);
    });

    it('should return false for form context', () => {
      expect(shouldShow403Page('form')).toBe(false);
    });

    it('should return false for picker context', () => {
      expect(shouldShow403Page('picker')).toBe(false);
    });
  });
});
