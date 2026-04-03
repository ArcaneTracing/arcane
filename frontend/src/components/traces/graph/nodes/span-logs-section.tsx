import { SpanInfoField } from "./span-info-field";
import { extractAttributeValue } from '@/lib/traces/otlp';
import type { SpanEvent } from '@/types/traces';

interface SpanLogsSectionProps {
  logs: SpanEvent[];
}

export function SpanLogsSection({ logs }: Readonly<SpanLogsSectionProps>) {
  if (logs.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Logs</h3>
      <div className="space-y-3">
        {logs.map((log, index) => {
          const attributes = log.attributes || []
          return (
            <div key={`log-${log.timestamp}-${index}`} className="text-sm space-y-1 border-l-2 pl-3">
              <div className="text-muted-foreground">
                {new Date(log.timestamp / 1000).toLocaleString()}
              </div>
              {attributes.map((attr) => {
                const extractedValue = extractAttributeValue(attr.value)
                return (
                  <SpanInfoField
                    key={`${log.timestamp}-${attr.key}`}
                    label={attr.key}
                    value={typeof extractedValue === 'string' ? extractedValue : JSON.stringify(extractedValue)}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  );
}

