

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return defaultMessage;
}

const stateRef: {current: {errorMessage: string | null;};} = {
  current: { errorMessage: null }
};

export function createUseActionErrorMock() {
  return {
    get message() {
      return stateRef.current.errorMessage;
    },
    handleError: jest.fn((error: unknown) => {
      stateRef.current.errorMessage = getErrorMessage(error, 'An error occurred');
    }),
    clear: jest.fn(() => {
      stateRef.current.errorMessage = null;
    })
  };
}

export function resetUseActionErrorMock() {
  stateRef.current = { errorMessage: null };
}