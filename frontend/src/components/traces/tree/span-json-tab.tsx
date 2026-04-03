"use client";

import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { JsonViewer } from './json-preview/json-previewer';
import type { NormalizedSpan } from '@/types/traces';

interface SpanJsonTabProps {
  selectedSpan: NormalizedSpan | null;
}
export function SpanJsonTab({ selectedSpan }: Readonly<SpanJsonTabProps>) {
  const handleCopy = async () => {
    if (!selectedSpan) return;

    const jsonString = JSON.stringify(selectedSpan, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-background border-b p-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={handleCopy}
          disabled={!selectedSpan}
          title={selectedSpan ? 'Copy span JSON' : 'No span selected'}>

          <Copy className="h-3 w-3 mr-1" />
          Copy
        </Button>
      </div>
      <div className="p-4">
        {selectedSpan ?
        <JsonViewer data={selectedSpan} rootName="span" defaultExpanded={true} /> :

        <div className="text-muted-foreground text-sm">Select a span to view JSON</div>
        }
      </div>
    </div>);

}