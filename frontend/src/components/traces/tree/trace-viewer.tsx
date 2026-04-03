"use client";

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useParams } from '@tanstack/react-router';
import { TraceTreePanel } from './trace-tree-panel';
import { TraceMetadataBar } from './trace-metadata-bar';
import { SpanPreviewTab } from './span-preview-tab';
import { SpanJsonTab } from './span-json-tab';
import { SpanConversationTab } from './span-conversation-tab';
import { SpanEventsTab } from './span-events-tab';
import { useEntitiesQuery } from '@/hooks/entities/use-entities-query';
import { AnnotateTraceDrawer } from './annotate-trace-drawer';
import { DatasetModeToggle } from './dataset-mode-toggle';
import { DatasetSelector } from './dataset-selector';
import { DatasetMappingDrawer } from './dataset-mapping-drawer';
import { ComponentErrorBoundary } from '@/components/ComponentErrorBoundary';
import { useOrganisationId } from '@/hooks/useOrganisation';
import { useTraceViewerState } from '@/hooks/traces/use-trace-viewer-state';
import { useTraceSpans } from '@/hooks/traces/use-trace-spans';
import { useDatasetModeState } from '@/hooks/traces/use-dataset-mode-state';
import { useTraceViewerPermissions } from '@/hooks/traces/use-trace-viewer-permissions';
import type { TempoTraceResponse } from '@/types/traces';

interface TraceViewerProps {
  trace: TempoTraceResponse | Record<string, unknown>;
  traceId: string;
  showAddToAnnotationQueue?: boolean;
  showAddToDataset?: boolean;
  initialSelectedSpanId?: string | null;
}

export function TraceViewer({
  trace,
  traceId,
  showAddToAnnotationQueue = true,
  showAddToDataset = true,
  initialSelectedSpanId = null
}: Readonly<TraceViewerProps>) {
  const params = useParams({ strict: false });
  const projectId = params?.projectId;
  const datasourceId = params?.datasourceId;
  const organisationId = useOrganisationId();

  const { data: entities = [] } = useEntitiesQuery();  const { spans, spanTree, traceMetrics } = useTraceSpans(trace, entities);  const {
    selectedSpan,
    expandedNodes,
    activeTab,
    isModelSpan,
    handleSpanSelect,
    toggleExpand,
    setActiveTab
  } = useTraceViewerState(spans, spanTree, initialSelectedSpanId);  const {
    datasetMode,
    selectedDatasetId,
    columnMappings,
    datasetColumns,
    isMappingDrawerOpen,
    mappedColumnsSet,
    setDatasetMode,
    setSelectedDatasetId,
    setIsMappingDrawerOpen,
    handleMapToColumn,
    handleRemoveMapping,
    handleAddToDataset
  } = useDatasetModeState(projectId);  const { effectiveShowAddToAnnotationQueue, effectiveShowAddToDataset } =
  useTraceViewerPermissions(
    organisationId,
    projectId,
    showAddToAnnotationQueue,
    showAddToDataset
  );

  const [isAnnotateDrawerOpen, setIsAnnotateDrawerOpen] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <ComponentErrorBoundary
      resetKeys={[traceId, activeTab]}
      scope="TraceViewer">

      <div className="flex h-full">
        {}
        <TraceTreePanel
          spanTree={spanTree}
          selectedSpanId={selectedSpan?.spanId}
          onSpanSelect={handleSpanSelect}
          expandedNodes={expandedNodes}
          onToggleExpand={toggleExpand}
          trace={trace} />      {}
      <div className="flex-1 flex flex-col overflow-hidden">
        {}
        <TraceMetadataBar
            traceMetrics={traceMetrics}
            onAnnotate={effectiveShowAddToAnnotationQueue ? () => setIsAnnotateDrawerOpen(true) : undefined}
            showAddToAnnotationQueue={effectiveShowAddToAnnotationQueue && !datasetMode}
            projectId={projectId}
            datasourceId={datasourceId}
            traceId={traceId} />        {}
        {effectiveShowAddToDataset &&
          <div className="border-b p-3 bg-gray-50/50 dark:bg-[#0D0D0D]/50 space-y-3">
            <DatasetModeToggle
              enabled={datasetMode}
              onToggle={setDatasetMode} />

            {datasetMode && projectId &&
            <DatasetSelector
              projectId={projectId}
              selectedDatasetId={selectedDatasetId}
              onSelect={setSelectedDatasetId} />

            }
          </div>
          }

        {}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              {isModelSpan &&
                <TabsTrigger value="conversation">Conversation View</TabsTrigger>
                }
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="json">JSON View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="flex-1 overflow-auto m-0">
            <SpanPreviewTab
                selectedSpan={selectedSpan}
                onCopy={handleCopy}
                showAddToAnnotationQueue={effectiveShowAddToAnnotationQueue && !datasetMode}
                showAddToDataset={effectiveShowAddToDataset && !datasetMode}
                projectId={projectId}
                datasourceId={datasourceId}
                traceId={traceId}
                datasetMode={datasetMode}
                datasetColumns={datasetColumns}
                onMapToColumn={handleMapToColumn}
                mappedColumns={mappedColumnsSet} />

          </TabsContent>

          {isModelSpan &&
            <TabsContent value="conversation" className="flex-1 overflow-auto m-0">
              <SpanConversationTab selectedSpan={selectedSpan} />
            </TabsContent>
            }

          <TabsContent value="events" className="flex-1 overflow-hidden m-0">
            <SpanEventsTab
                spans={spans}
                selectedSpan={selectedSpan}
                onSpanSelect={handleSpanSelect} />

          </TabsContent>

          <TabsContent value="json" className="flex-1 overflow-auto m-0">
            <SpanJsonTab selectedSpan={selectedSpan} />
          </TabsContent>
        </Tabs>
      </div>

      {}
      {effectiveShowAddToAnnotationQueue && projectId &&
        <AnnotateTraceDrawer
          projectId={projectId}
          traceId={traceId}
          isOpen={isAnnotateDrawerOpen}
          onClose={() => setIsAnnotateDrawerOpen(false)} />

        }

      {}
      {effectiveShowAddToDataset && projectId &&
        <DatasetMappingDrawer
          projectId={projectId}
          datasetId={selectedDatasetId}
          mappings={columnMappings}
          isOpen={isMappingDrawerOpen}
          onOpenChange={setIsMappingDrawerOpen}
          onAddToDataset={handleAddToDataset}
          onRemoveMapping={handleRemoveMapping} />

        }
    </div>
    </ComponentErrorBoundary>);

}