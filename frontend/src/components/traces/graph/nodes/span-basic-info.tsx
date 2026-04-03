import { SpanInfoField } from "./span-info-field";

interface SpanBasicInfoProps {
  spanName: string;
  serviceName: string;
  duration: number;
  spanId?: string;
  variant?: 'inline' | 'detailed';
}

export function SpanBasicInfo({
  spanName,
  serviceName,
  duration,
  spanId,
  variant = 'inline'
}: Readonly<SpanBasicInfoProps>) {
  if (variant === 'detailed') {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold">Basic Information</h3>
        <div className="space-y-1">
          <SpanInfoField label="Operation" value={spanName} />
          <SpanInfoField label="Service" value={serviceName} />
          <SpanInfoField label="Duration" value={`${(duration / 1000).toFixed(2)}ms`} />
          {spanId &&
          <SpanInfoField label="Span ID" value={spanId} />
          }
        </div>
      </div>);

  }


  return (
    <div className="font-medium">
      {spanName}
    </div>);

}

export function SpanServiceInfo({ serviceName }: Readonly<{serviceName: string;}>) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-muted-foreground">
        {serviceName}
      </div>
    </div>);

}

export function SpanDurationInfo({ duration }: Readonly<{duration: number;}>) {
  return (
    <div className="text-xs text-muted-foreground">
      {(duration / 1000).toFixed(2)}ms
    </div>);

}