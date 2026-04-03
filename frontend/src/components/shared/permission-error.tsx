import { isForbiddenError, getErrorMessage } from "@/lib/error-handling";
import { AlertCircle } from "lucide-react";

interface PermissionErrorProps {
  error: unknown;
  resourceName?: string;
  action?: string;
  className?: string;
}
export function PermissionError({
  error,
  resourceName = "this resource",
  action = "view",
  className = ""
}: Readonly<PermissionErrorProps>) {
  if (!isForbiddenError(error)) {
    return null;
  }

  const message = getErrorMessage(error, `You don't have permission to ${action} ${resourceName}.`);

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>);

}