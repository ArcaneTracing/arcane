import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
  onError?: (error: unknown, info: {componentStack: string;}) => void;
};


export function AppErrorBoundary({ children, onError }: Readonly<AppErrorBoundaryProps>) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('[AppErrorBoundary] Error caught:', error);
        console.error('[AppErrorBoundary] Error info:', info);
        if (onError) {
          onError(error, info);
        }
      }}>

      {children}
    </ReactErrorBoundary>);

}