import type { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { safeStringify } from '@/lib/utils';

export function ErrorFallback({ error, resetErrorBoundary }: Readonly<FallbackProps>) {
  const message = (() => {
    if (error instanceof Error) return error.message;
    if (error == null) return 'Unknown error';
    return safeStringify(error);
  })();

  return (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-6 text-center"
      role="alert">

      <h2 className="text-lg font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => resetErrorBoundary()} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline">
          <a href="/">Go home</a>
        </Button>
      </div>
      {process.env.NODE_ENV !== 'production' && error instanceof Error && error.stack &&
      <details className="mt-4 max-w-full">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Stack (dev only)
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded border bg-muted p-2 text-left text-xs">
            {error.stack}
          </pre>
        </details>
      }
    </div>);

}

export function RouteErrorFallback({
  error,
  reset
}: Readonly<{error: unknown;reset: () => void;}>) {
  return <ErrorFallback error={error} resetErrorBoundary={reset} />;
}