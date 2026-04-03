"use client";

import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSpanIcon, formatDuration } from '@/components/traces/tree/trace-viewer-utils';
import { getEntityIcon, getEntityIconColor } from '@/lib/entity-utils';
import { EntityType } from '@/types/enums';

import type { NormalizedSpan } from '@/types/traces';

interface SpanTreeNodeProps {
  span: NormalizedSpan;
  depth?: number;
  selectedSpanId?: string | null;
  onSelect: (span: NormalizedSpan) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (spanId: string) => void;
}
export function SpanTreeNode({
  span,
  depth = 0,
  selectedSpanId,
  onSelect,
  expandedNodes,
  onToggleExpand
}: Readonly<SpanTreeNodeProps>) {
  const hasChildren = span.children && span.children.length > 0;
  const isSelected = selectedSpanId === span.spanId;
  const isExpanded = expandedNodes.has(span.spanId);


  const DefaultIcon = getSpanIcon(span.name);
  const entityIconColor = span.matchedEntity?.entityType ?
  getEntityIconColor(span.matchedEntity.entityType, span.matchedEntity.iconId) :
  '';
  const entityIcon = (() => {
    if (!span.matchedEntity?.entityType) return null;
    return getEntityIcon(
      span.matchedEntity.entityType,
      `${entityIconColor} h-3.5 w-3.5`,
      span.matchedEntity.entityType === EntityType.CUSTOM ? span.matchedEntity.iconId : undefined
    );
  })();

  return (
    <div>
      <div
        className="flex items-center gap-2 w-full"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}>

        {hasChildren ?
        <button
          type="button"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(span.spanId);
          }}
          className="p-0.5 hover:bg-gray-100 dark:hover:bg-[#1F1F1F] rounded cursor-pointer shrink-0 border-0 bg-transparent">

            {isExpanded ?
          <ChevronDown className="h-3 w-3" /> :

          <ChevronRight className="h-3 w-3" />
          }
          </button> :

        <div className="w-4 shrink-0" />
        }
        <button
          type="button"
          className={cn(
            "flex-1 flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50 rounded-sm text-left bg-transparent border-0 min-w-0",
            isSelected && "bg-gray-100 dark:bg-[#1F1F1F]"
          )}
          onClick={() => onSelect(span)}>

          {entityIcon ?
          <span className="h-3.5 w-3.5 flex-shrink-0">
              {entityIcon}
            </span> :

          <DefaultIcon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          }
          <span className="text-sm font-medium flex-1 truncate">{span.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">{formatDuration(span.duration)}</span>
        </button>
      </div>
      {hasChildren && isExpanded &&
      <div>
          {span.children!.map((child) =>
        <SpanTreeNode
          key={child.spanId}
          span={child}
          depth={depth + 1}
          selectedSpanId={selectedSpanId}
          onSelect={onSelect}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand} />

        )}
        </div>
      }
    </div>);

}