"use client";

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDuration, formatTimestamp } from './trace-viewer-utils';
import { SpanAttributesTable } from './span-attributes-table';
import { Highlight, HighlightValueType, MessageMatchingType } from '@/types';
import { extractMessagesFromSpan, convertMessagesToDatasetFormat } from '@/lib/message-matching/span-messages';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger } from
'@/components/ui/context-menu';
import type { NormalizedSpan } from '@/types/traces';

interface SpanPreviewTabProps {
  selectedSpan: NormalizedSpan | null;
  onCopy: (text: string) => Promise<void>;
  showAddToAnnotationQueue?: boolean;
  showAddToDataset?: boolean;
  projectId?: string;
  datasourceId?: string;
  traceId?: string;
  datasetMode?: boolean;
  datasetColumns?: string[];
  onMapToColumn?: (columnName: string, value: string, mode: 'add' | 'map') => void;
  mappedColumns?: Set<string>;
}

export function SpanPreviewTab({
  selectedSpan,
  onCopy,
  showAddToAnnotationQueue = true,
  showAddToDataset = true,
  projectId,
  datasourceId,
  traceId,
  datasetMode = false,
  datasetColumns = [],
  onMapToColumn,
  mappedColumns = new Set()
}: Readonly<SpanPreviewTabProps>) {


  const entityHighlights = useMemo(() => {
    if (!selectedSpan?.matchedEntity?.entityHighlights || !selectedSpan.attributes) {
      return [];
    }

    const highlights: Array<{title: string;value: string;}> = [];

    selectedSpan.matchedEntity.entityHighlights.forEach((highlight: Highlight) => {

      const attribute = selectedSpan.attributes?.find(
        (attr: SpanAttribute) => attr.key === highlight.key
      );

      if (attribute) {
        let formattedValue: string = '';


        switch (highlight.valueType) {
          case HighlightValueType.NUMBER:
            formattedValue = String(Number(attribute.value) || '');
            break;
          case HighlightValueType.BOOLEAN:
            formattedValue = String(Boolean(attribute.value));
            break;
          case HighlightValueType.STRING:
          case HighlightValueType.OBJECT:
          default:
            formattedValue =
            typeof attribute.value === 'object' && attribute.value !== null ?
            JSON.stringify(attribute.value) :
            String(attribute.value ?? '');
        }

        if (formattedValue) {
          highlights.push({
            title: highlight.title,
            value: formattedValue
          });
        }
      }
    });

    return highlights;
  }, [selectedSpan?.matchedEntity?.entityHighlights, selectedSpan?.attributes]);


  const isModelSpan = useMemo(() => {
    return !!(
    selectedSpan?.matchedEntity?.messageMatching && (
    selectedSpan.matchedEntity.messageMatching.type === MessageMatchingType.CANONICAL ||
    selectedSpan.matchedEntity.messageMatching.type === MessageMatchingType.FLAT));

  }, [selectedSpan?.matchedEntity]);


  const spanMessages = useMemo(() => {
    if (!isModelSpan || !selectedSpan) return [];
    return extractMessagesFromSpan(selectedSpan, selectedSpan.matchedEntity);
  }, [isModelSpan, selectedSpan]);

  if (!selectedSpan) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select a span from the left panel to view details
      </div>);

  }

  const handleCopy = async (text: string) => {
    await onCopy(text);
  };

  const handleMapSpanToColumn = (columnName: string, mode: 'add' | 'map') => {
    if (!selectedSpan || !onMapToColumn) return;


    const spanJson = JSON.stringify(selectedSpan, null, 2);
    onMapToColumn(columnName, spanJson, mode);
  };

  const getAvailableColumns = () => {


    return datasetColumns;
  };

  const handleAddMessagesToColumn = (columnName: string, mode: 'add' | 'map') => {
    if (!onMapToColumn || spanMessages.length === 0) return;

    const messagesJson = convertMessagesToDatasetFormat(spanMessages);
    onMapToColumn(columnName, messagesJson, mode);
  };

  const availableColumns = getAvailableColumns();
  const spanNameElement =
  <h3 className="text-sm font-medium mb-2">{selectedSpan.name}</h3>;


  return (
    <div className="p-4 space-y-4">
      {}
      <div>
        {datasetMode && onMapToColumn && availableColumns.length > 0 ?
        <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="cursor-context-menu">
                {spanNameElement}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Add Span to Column</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {availableColumns.map((columnName) =>
                <ContextMenuItem
                  key={columnName}
                  onClick={() => handleMapSpanToColumn(columnName, 'add')}>

                      {columnName}
                    </ContextMenuItem>
                )}
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Map Span to Column</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {availableColumns.map((columnName) =>
                <ContextMenuItem
                  key={columnName}
                  onClick={() => handleMapSpanToColumn(columnName, 'map')}>

                      {columnName}
                    </ContextMenuItem>
                )}
                </ContextMenuSubContent>
              </ContextMenuSub>
              {isModelSpan && spanMessages.length > 0 &&
            <>
                  <ContextMenuSeparator />
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>
                      Add Messages to Column ({spanMessages.length} message{spanMessages.length === 1 ? '' : 's'})
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      {availableColumns.map((columnName) =>
                  <ContextMenuItem
                    key={columnName}
                    onClick={() => handleAddMessagesToColumn(columnName, 'add')}>

                          {columnName}
                        </ContextMenuItem>
                  )}
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>
                      Map Messages to Column ({spanMessages.length} message{spanMessages.length === 1 ? '' : 's'})
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      {availableColumns.map((columnName) =>
                  <ContextMenuItem
                    key={columnName}
                    onClick={() => handleAddMessagesToColumn(columnName, 'map')}>

                          {columnName}
                        </ContextMenuItem>
                  )}
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                </>
            }
            </ContextMenuContent>
          </ContextMenu> :

        spanNameElement
        }
        <div className="text-xs text-muted-foreground mb-3">
          Duration: {formatDuration(selectedSpan.duration)} | 
          Start: {formatTimestamp(selectedSpan.startTime)} | 
          End: {formatTimestamp(selectedSpan.endTime)}
        </div>
        
        {}
        {entityHighlights.length > 0 &&
        <div className="flex items-center gap-2 flex-wrap">
            {entityHighlights.map((highlight) =>
          <Badge
            key={`${highlight.title}-${highlight.value}`}
            variant="outline"
            className="rounded-md">

                {highlight.title}: {highlight.value}
              </Badge>
          )}
          </div>
        }
      </div>

      {}
      {selectedSpan.attributes && selectedSpan.attributes.length > 0 &&
      <SpanAttributesTable
        attributes={selectedSpan.attributes}
        onCopy={handleCopy}
        datasetMode={datasetMode}
        datasetColumns={datasetColumns}
        onMapToColumn={onMapToColumn}
        mappedColumns={mappedColumns} />

      }
    </div>);

}