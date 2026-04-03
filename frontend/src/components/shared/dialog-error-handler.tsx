import { ReactNode } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useFormErrors } from '@/hooks/shared/use-form-errors';
import { FormErrorDisplay } from './form-error-display';

interface DialogErrorHandlerProps {
  mutation: UseMutationResult<any, unknown, any, unknown>;
  children: ReactNode;
  errorDisplayPosition?: 'top' | 'bottom';
  showError?: boolean;
}
export function DialogErrorHandler({
  mutation,
  children,
  errorDisplayPosition = 'top',
  showError = true
}: Readonly<DialogErrorHandlerProps>) {
  const formErrors = useFormErrors({ mutation, resetOnOpen: true });

  return (
    <>
      {showError && formErrors.general && errorDisplayPosition === 'top' &&
      <div className="px-6 pt-4">
          <FormErrorDisplay error={formErrors.general} variant="default" />
        </div>
      }
      {children}
      {showError && formErrors.general && errorDisplayPosition === 'bottom' &&
      <div className="px-6 pb-4">
          <FormErrorDisplay error={formErrors.general} variant="default" />
        </div>
      }
    </>);

}