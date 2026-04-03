

const ref: {
  mutationData: Map<any, {onSuccess: () => void;mutation: any;}>;
  mutationSuccessWatchers: Array<{mutation: any;onSuccess: () => void;}>;
} = {
  mutationData: new Map(),
  mutationSuccessWatchers: []
};

export const mockUseMutationAction = jest.fn(({ mutation, onSuccess }: {mutation: any;onSuccess?: () => void;}) => {
  if (onSuccess) {
    ref.mutationData.set(mutation, { onSuccess, mutation });
    ref.mutationSuccessWatchers.push({ mutation, onSuccess });

    if (mutation.isSuccess) {
      Promise.resolve().then(() => {
        if (mutation.isSuccess && onSuccess) onSuccess();
      });
    }
  }

  return {
    ...mutation,
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message || null,
    handleError: jest.fn(),
    clear: jest.fn(),
    clearError: jest.fn()
  };
});

export function clearMutationActionMocks() {
  ref.mutationData = new Map();
  ref.mutationSuccessWatchers = [];
}
export async function markMutationSuccess(mutation: any) {
  Object.assign(mutation, {
    isSuccess: true,
    isPending: false,
    status: 'success'
  });

  const { act } = require('@testing-library/react');
  await act(async () => {
    await Promise.resolve();
    ref.mutationSuccessWatchers.forEach(({ mutation: m, onSuccess }) => {
      if (m === mutation && m.isSuccess) onSuccess();
    });
  });
}
export function triggerAllMutationSuccessCallbacks() {
  ref.mutationSuccessWatchers.forEach(({ onSuccess }) => onSuccess());
}