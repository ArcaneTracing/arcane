"use client";

import { Handle, Position } from '@xyflow/react';
import { SpanBasicInfo, SpanServiceInfo, SpanDurationInfo } from "./span-basic-info";
import { SpanDetailsPopover } from "./span-details-popover";
import { getEntityBorderColor, getEntityIcon, getEntityIconColor } from '@/lib/entity-utils';
import { EntityType } from '@/types';
import { cn } from '@/lib/utils';
import type { TraceSpanNodeData } from '@/types/traces';

export interface TraceSpanNodeProps {
  id: string;
  data: TraceSpanNodeData;
  isConnectable: boolean;
}

export default function TraceSpanNode({ id, data, isConnectable }: Readonly<TraceSpanNodeProps>) {
  const { spanName, serviceName, duration, tags = [], logs = [], matchedEntity } = data;


  const entityBorderColor = matchedEntity?.entityType ?
  getEntityBorderColor(matchedEntity.entityType) :
  '';
  const entityIconColor = matchedEntity?.entityType ?
  getEntityIconColor(matchedEntity.entityType, matchedEntity.iconId) :
  '';
  const entityIcon = (() => {
    if (!matchedEntity?.entityType) return null;
    return getEntityIcon(
      matchedEntity.entityType,
      entityIconColor,
      matchedEntity.entityType === EntityType.CUSTOM ? matchedEntity.iconId : undefined
    );
  })();

  return (
    <div className={cn(
      "bg-white dark:bg-background rounded-lg shadow-sm px-4 py-2 border-2 min-w-[250px]",
      entityBorderColor || "border-gray-200 dark:border-gray-800"
    )}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 !bg-muted-foreground" />

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {entityIcon &&
            <span className="flex-shrink-0">
                {entityIcon}
              </span>
            }
            <SpanBasicInfo
              spanName={spanName}
              serviceName={serviceName}
              duration={duration}
              variant="inline" />

          </div>
          <SpanDetailsPopover
            spanName={spanName}
            serviceName={serviceName}
            duration={duration}
            spanId={id}
            tags={tags}
            logs={logs} />

        </div>
        <SpanServiceInfo serviceName={serviceName} />
        <SpanDurationInfo duration={duration} />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 !bg-muted-foreground" />

    </div>);

}