import type { ErrorInfo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { CompactErrorFallback } from '@/components/CompactErrorFallback';

export type ComponentErrorBoundaryOnErrorInfo = {
  componentStack: string;
  scope?: string;
};

type ComponentErrorBoundaryProps = {
  children: React.ReactNode;

  fallback?: React.ReactNode;

  FallbackComponent?: React.ComponentType<FallbackProps>;

  fallbackRender?: (props: FallbackProps) => React.ReactNode;

  resetKeys?: unknown[];
  onError?: (error: unknown, info: ComponentErrorBoundaryOnErrorInfo) => void;
  onReset?: (details:
  {reason: 'imperative-api';args: unknown[];} |
  {reason: 'keys';prev: unknown[] | undefined;next: unknown[] | undefined;})
  => void;

  scope?: string;
};
export function ComponentErrorBoundary({
  children,
  fallback,
  FallbackComponent,
  fallbackRender,
  resetKeys,
  onError,
  onReset,
  scope
}: Readonly<ComponentErrorBoundaryProps>) {
  const effectiveOnError =
  onError == null ?
  undefined :
  (error: unknown, info: ErrorInfo) =>
  onError(error, scope == null ? info : { ...info, scope });

  const shared = {
    onError: effectiveOnError,
    onReset,
    resetKeys,
    children
  };

  if (fallback != null) {
    return <ReactErrorBoundary {...shared} fallback={fallback} />;
  }
  if (FallbackComponent != null) {
    return <ReactErrorBoundary {...shared} FallbackComponent={FallbackComponent} />;
  }
  if (fallbackRender != null) {
    return <ReactErrorBoundary {...shared} fallbackRender={fallbackRender} />;
  }
  return (
    <ReactErrorBoundary
      {...shared}
      FallbackComponent={CompactErrorFallback} />);


}