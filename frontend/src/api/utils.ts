
export const normalizeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};


export const extractApiError = (result: any): string => {
  if (result.errorType || result.validationErrorType) {
    return result.message || 'An error occurred';
  }
  return normalizeError(result);
};
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      return { error: 'Unauthorized' };
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(extractApiError(errorData));
  }


  if (response.status === 204) {
    return undefined;
  }

  const result = await response.json();
  if (result.errorType || result.validationErrorType) {
    throw new Error(extractApiError(result));
  }

  return result;
};