import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormErrorDisplayProps {
  error: string | null;
  variant?: 'default' | 'inline' | 'toast';
  className?: string;
}

export function FormErrorDisplay({
  error,
  variant = 'default',
  className
}: Readonly<FormErrorDisplayProps>) {
  if (!error) return null;

  if (variant === 'inline') {
    return (
      <p className={`text-sm text-destructive ${className || ''}`}>
        {error}
      </p>);

  }

  if (variant === 'toast') {

    return null;
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>);

}