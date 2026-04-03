
export {
  createUseActionErrorMock,
  resetUseActionErrorMock } from
'./use-action-error-mock';
export {
  mockUseMutationAction,
  clearMutationActionMocks,
  markMutationSuccess,
  triggerAllMutationSuccessCallbacks } from
'./mutation-action-mocks';
export {
  showSuccessToast,
  showErrorToast,
  showErrorToastFromError,
  showWarningToast,
  showInfoToast,
  resetToastMocks } from
'./toast-mocks';
import { resetUseActionErrorMock } from './use-action-error-mock';
import { clearMutationActionMocks } from './mutation-action-mocks';
import { resetToastMocks } from './toast-mocks';


export function resetAllSharedMocks() {
  resetUseActionErrorMock();
  clearMutationActionMocks();
  resetToastMocks();
}