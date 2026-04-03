import type { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { safeStringify } from '@/lib/utils';

export function CompactErrorFallback({
  error,
  resetErrorBoundary
}: Readonly<FallbackProps>) {
  const message = (() => {
    if (error instanceof Error) return error.message;
    if (error == null) return 'Unknown error';
    return safeStringify(error);
  })();

  return (
    <div
      className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center"
      role="alert">

      <p className="text-sm font-medium text-foreground">
        Something went wrong here
      </p>
      <p className="max-w-sm text-xs text-muted-foreground" title={message}>
        {message}
      </p>
      <Button
        onClick={() => resetErrorBoundary()}
        variant="outline"
        size="sm">

        Retry
      </Button>
    </div>);

}