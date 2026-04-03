"use client";

import { TraceGraph } from "@/components/traces/graph/trace-graph";
import { TraceViewer } from "@/components/traces/tree/trace-viewer";
import { TraceConversation } from "@/components/traces/conversation/trace-conversation";
import { SpanEventsTab } from "@/components/traces/tree/span-events-tab";
import { useEntitiesQuery } from "@/hooks/entities/use-entities-query";
import { useTraceSpans } from "@/hooks/traces/use-trace-spans";
import { Loader } from "@/components/ui/loader";
import { ComponentErrorBoundary } from "@/components/ComponentErrorBoundary";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Info } from "lucide-react";
import { useState, useEffect } from "react";
import type { TraceDetailVisualization } from "@/hooks/traces/use-trace-detail-url-state";
import type { TempoTraceResponse, NormalizedSpan } from "@/types/traces";

export interface TraceDetailPageViewProps {
  trace: TempoTraceResponse;
  traceId: string;
  parentSpanName: string | null;
  allServiceNames: string[];
  visualizationType: TraceDetailVisualization;
  onVisualizationChange: (value: TraceDetailVisualization) => void;
  onBack: () => void;
}

export function TraceDetailPageView({
  trace,
  traceId,
  parentSpanName,
  allServiceNames,
  visualizationType,
  onVisualizationChange,
  onBack
}: Readonly<TraceDetailPageViewProps>) {
  const { data: entities = [], isLoading: isEntitiesLoading } = useEntitiesQuery();
  const { spans } = useTraceSpans(trace, entities);
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);


  const handleSpanSelectFromEvents = (span: NormalizedSpan) => {
    setSelectedSpanId(span.spanId);
    onVisualizationChange('viewer');
  };


  useEffect(() => {
    if (visualizationType !== 'viewer') {
      setSelectedSpanId(null);
    }
  }, [visualizationType]);

  return (
    <div className="flex h-full flex-col pt-6 pl-4" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="flex-1 border-r flex flex-col overflow-hidden" style={{ height: '100%' }}>
        <div className="border-b p-4 bg-background flex-shrink-0 z-10">
          <div className="px-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Traces
            </Button>
            <h2 className="text-lg font-semibold">
              {parentSpanName ? `${parentSpanName}: ${traceId}` : `Trace ${traceId}`}
            </h2>
            {allServiceNames.length > 0 &&
            <p className="text-sm text-muted-foreground mt-1">
                {allServiceNames.join(", ")}
              </p>
            }
          </div>
          <Tabs
            value={visualizationType}
            onValueChange={(v) => onVisualizationChange(v as TraceDetailVisualization)}
            className="mt-4">

            <TabsList>
              <TabsTrigger value="graph">Graph</TabsTrigger>
              <TabsTrigger value="viewer">Viewer</TabsTrigger>
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="trace-events">Events</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden min-h-0" style={{ width: '100%' }}>
            {visualizationType === "graph" && <TraceGraph trace={trace} traceId={traceId} />}
            {visualizationType === "viewer" &&
            <TraceViewer
              trace={trace}
              traceId={traceId}
              initialSelectedSpanId={selectedSpanId} />

            }
            {visualizationType === "conversation" &&
            <div className="h-full flex flex-col min-h-0">
                <div className="px-4 pt-4 flex-shrink-0">
                  <Alert data-testid="conversation-disclaimer">
                    <Info className="h-4 w-4" />
                    <AlertTitle>How conversations are built</AlertTitle>
                    <AlertDescription>
                      <p>
                        Conversations are derived from model spans in the trace by matching spans to configured entities.
                        Each entity defines message matching patterns (canonical or flat) that extract messages from span attributes.
                        Messages from all matched spans are merged, deduplicated, and sorted chronologically to reconstruct the conversation.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="flex-1 overflow-hidden min-h-0">
                  <TraceConversation trace={trace} />
                </div>
              </div>
            }
            {visualizationType === "trace-events" &&
            <ComponentErrorBoundary resetKeys={[trace, traceId]} scope="TraceEvents">
                {isEntitiesLoading ?
              <div className="flex items-center justify-center h-full">
                    <Loader size="lg" />
                  </div> :

              <SpanEventsTab
                spans={spans}
                selectedSpan={null}
                onSpanSelect={handleSpanSelectFromEvents} />

              }
              </ComponentErrorBoundary>
            }
          </div>
        </div>
      </div>
    </div>);

}