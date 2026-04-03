"use client"

import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { SpanBasicInfo } from "./span-basic-info";
import { SpanTagsSection } from "./span-tags-section";
import { SpanLogsSection } from "./span-logs-section";
import type { SpanAttribute, SpanEvent } from '@/types/traces';

interface SpanDetailsPopoverProps {
  spanName: string;
  serviceName: string;
  duration: number;
  spanId: string;
  tags?: SpanAttribute[];
  logs?: SpanEvent[];
}

export function SpanDetailsPopover({
  spanName,
  serviceName,
  duration,
  spanId,
  tags = [],
  logs = [],
}: Readonly<SpanDetailsPopoverProps>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" side="right" align="start">
        <div className="h-[300px] overflow-auto">
          <div className="space-y-6">
            <SpanBasicInfo
              spanName={spanName}
              serviceName={serviceName}
              duration={duration}
              spanId={spanId}
              variant="detailed"
            />
            <SpanTagsSection tags={tags} />
            <SpanLogsSection logs={logs} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

