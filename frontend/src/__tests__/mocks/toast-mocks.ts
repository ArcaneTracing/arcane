


export const showSuccessToast = jest.fn();
export const showErrorToast = jest.fn();
export const showErrorToastFromError = jest.fn();
export const showWarningToast = jest.fn();
export const showInfoToast = jest.fn();
export function resetToastMocks() {
  showSuccessToast.mockClear();
  showErrorToast.mockClear();
  showErrorToastFromError.mockClear();
  showWarningToast.mockClear();
  showInfoToast.mockClear();
}