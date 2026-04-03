"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDuration, formatTimestamp } from './trace-viewer-utils';
import { AddToQueueDialog } from '@/components/traces/list/add-to-queue-dialog';

interface TraceMetrics {
  duration: number;
  startTime: number;
  serviceName: string;
}

interface TraceMetadataBarProps {
  traceMetrics: TraceMetrics | null;
  onAnnotate?: () => void;
  showAddToAnnotationQueue?: boolean;
  projectId?: string;
  datasourceId?: string;
  traceId?: string;
}
export function TraceMetadataBar({
  traceMetrics,
  onAnnotate,
  showAddToAnnotationQueue = false,
  projectId,
  datasourceId,
  traceId
}: Readonly<TraceMetadataBarProps>) {
  if (!traceMetrics) return null;

  return (
    <div className="border-b p-3 bg-gray-50/50 dark:bg-[#0D0D0D]/50">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">
            {traceMetrics.serviceName ? `Env: ${traceMetrics.serviceName}` : 'Env: default'}
          </Badge>
          <Badge variant="outline">
            Latency: {formatDuration(traceMetrics.duration)}
          </Badge>
          {!!traceMetrics.startTime &&
          <span className="text-xs text-muted-foreground">
              {formatTimestamp(traceMetrics.startTime)}
            </span>
          }
        </div>
        <div className="flex items-center gap-2">
          {showAddToAnnotationQueue && projectId && datasourceId && traceId &&
          <AddToQueueDialog
            selectedTraces={new Set([traceId])}
            projectId={projectId}
            datasourceId={datasourceId}
            trigger={
            <Button variant="outline" size="sm">+ Add to annotation queue</Button>
            } />

          }
          {onAnnotate &&
          <Button variant="outline" size="sm" onClick={onAnnotate}>
              Annotate
            </Button>
          }
        </div>
      </div>
    </div>);

}