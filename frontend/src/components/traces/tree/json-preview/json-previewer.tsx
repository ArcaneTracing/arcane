"use client";

import * as React from "react";
import { ChevronRight, ChevronDown, Copy, Check, MoreHorizontal, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  getJsonDataType,
  isJsonExpandable,
  getItemCount,
  getBracketChar,
  formatItemCount,
  type JsonDataType } from
'./json-node-utils';

type JsonViewerProps = {
  data: any;
  rootName?: string;
  defaultExpanded?: boolean;
  className?: string;
};

export function JsonViewer({ data, rootName = "root", defaultExpanded = true, className }: Readonly<JsonViewerProps>) {
  return (
    <TooltipProvider>
      <div className={cn("font-mono text-sm", className)}>
        <JsonNode name={rootName} data={data} isRoot={true} defaultExpanded={defaultExpanded} />
      </div>
    </TooltipProvider>);

}

type JsonNodeProps = {
  name: string;
  data: any;
  isRoot?: boolean;
  defaultExpanded?: boolean;
  level?: number;
};

type ExpandIconProps = {
  isExpanded: boolean;
};

function ExpandIcon({ isExpanded }: Readonly<ExpandIconProps>) {
  return (
    <div className="w-4 h-4 flex items-center justify-center">
      {isExpanded ?
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> :

      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      }
    </div>);

}

type TypeIndicatorProps = {
  isExpandable: boolean;
  dataType: JsonDataType;
  isExpanded: boolean;
  itemCount: number;
};

function TypeIndicator({ isExpandable, dataType, isExpanded, itemCount }: Readonly<TypeIndicatorProps>) {
  if (!isExpandable) {
    return <span className="text-muted-foreground">:</span>;
  }

  const openBracket = getBracketChar(dataType, true);
  const itemCountText = isExpanded ? null : formatItemCount(itemCount, dataType);

  return (
    <span className="text-muted-foreground">
      {openBracket}
      {itemCountText}
    </span>);

}

type CopyButtonProps = {
  onCopy: (e: React.MouseEvent) => void;
  isCopied: boolean;
};

function CopyButton({ onCopy, isCopied }: Readonly<CopyButtonProps>) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="ml-auto opacity-0 group-hover/property:opacity-100 hover:bg-muted p-1 rounded"
      title="Copy to clipboard">

      {isCopied ?
      <Check className="h-3.5 w-3.5 text-green-500" /> :

      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      }
    </button>);

}

type ExpandableContentProps = {
  data: Record<string, unknown> | unknown[];
  dataType: JsonDataType;
  level: number;
};

function ExpandableContent({ data, dataType, level }: Readonly<ExpandableContentProps>) {
  const closeBracket = getBracketChar(dataType, false);
  const keys = Object.keys(data);

  return (
    <div className="pl-4">
      {keys.map((key) =>
      <JsonNode
        key={key}
        name={dataType === 'array' ? `${key}` : key}
        data={data[key as keyof typeof data]}
        level={level + 1}
        defaultExpanded={level < 1} />

      )}
      <div className="text-muted-foreground pl-4 py-1">{closeBracket}</div>
    </div>);

}

function JsonNode({ name, data, isRoot = false, defaultExpanded = true, level = 0 }: Readonly<JsonNodeProps>) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [isCopied, setIsCopied] = React.useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const dataType = getJsonDataType(data);
  const isExpandable = isJsonExpandable(data, dataType);
  const itemCount = isExpandable ? getItemCount(data) : 0;
  const showExpandedContent = isExpandable && isExpanded && data !== null && data !== undefined;

  return (
    <div className={cn('pl-4 group/object', level > 0 && 'border-l border-border')}>
      <div
        className={cn(
          'flex items-center gap-1 py-1 hover:bg-muted/50 rounded px-1 -ml-4 cursor-pointer group/property',
          isRoot && 'text-primary font-semibold'
        )}>

        <button
          type="button"
          className="flex items-center gap-1 flex-1 min-w-0 text-left"
          onClick={isExpandable ? handleToggle : undefined}
          onKeyDown={isExpandable ? handleKeyDown : undefined}
          disabled={!isExpandable}>

          {isExpandable ? <ExpandIcon isExpanded={isExpanded} /> : <div className="w-4" />}
          <span className="text-primary">{name}</span>
          <TypeIndicator isExpandable={isExpandable} dataType={dataType} isExpanded={isExpanded} itemCount={itemCount} />
          {!isExpandable && <JsonValue data={data} />}
          {!isExpandable && <div className="w-3.5" />}
        </button>
        <CopyButton onCopy={copyToClipboard} isCopied={isCopied} />
      </div>
      {showExpandedContent && <ExpandableContent data={data as Record<string, unknown> | unknown[]} dataType={dataType} level={level} />}
    </div>);

}


function JsonValue({ data }: Readonly<{data: any;}>) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const dataType = typeof data;
  const TEXT_LIMIT = 80;

  if (data === null) {
    return <span className="text-rose-500">null</span>;
  }

  if (data === undefined) {
    return <span className="text-muted-foreground">undefined</span>;
  }

  if (data instanceof Date) {
    return <span className="text-purple-500">{data.toISOString()}</span>;
  }

  switch (dataType) {
    case "string":
      if (data.length > TEXT_LIMIT) {
        return (
          <button
            type="button"
            className="text-emerald-500 flex-1 flex items-center relative group cursor-pointer text-left bg-transparent border-0 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}>

            {`"`}
            {isExpanded ?
            <span className="inline-block max-w-full">{data}</span> :

            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className="inline-block max-w-full">{data.substring(0, TEXT_LIMIT)}...</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-md text-xs p-2 break-words">
                  {data}
                </TooltipContent>
              </Tooltip>
            }
            {`"`}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+4px)] opacity-0 group-hover:opacity-100 transition-opacity">
              {isExpanded ?
              <ChevronUp className="h-3 w-3 text-muted-foreground" /> :

              <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
              }
            </div>
          </button>);

      }
      return <span className="text-emerald-500">{`"${data}"`}</span>;
    case "number":
      return <span className="text-amber-500">{data}</span>;
    case "boolean":
      return <span className="text-blue-500">{data.toString()}</span>;
    default:
      return <span>{String(data)}</span>;
  }
}