import { ArrowRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEntityIcon, getEntityIconColor } from '@/lib/entity-utils';
import { showSuccessToast } from '@/lib/toast';
import { extractAttributeValue } from '@/lib/traces/otlp';
import { getSpanIcon } from './trace-viewer-utils';
import { EntityType } from '@/types/enums';
import type { NormalizedSpan, SpanEvent } from '@/types/traces';

interface EventCardProps {
  event: SpanEvent;
  span: NormalizedSpan;
  isViewingSingleSpan: boolean;
  onSpanSelect: (span: NormalizedSpan) => void;
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    showSuccessToast(`${label} copied to clipboard`);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

export function EventCard({
  event,
  span,
  isViewingSingleSpan,
  onSpanSelect
}: Readonly<EventCardProps>) {
  const eventName = (event as { name?: string }).name || null;
  const eventAttributes = (event as { attributes?: Array<{ key: string; value: unknown }> })
    .attributes || [];

  const handleCopyEvent = async () => {
    const eventJson = JSON.stringify(event, null, 2);
    await copyToClipboard(eventJson, 'Event');
  };

  const renderSpanIcon = () => {
    if (span.matchedEntity?.entityType) {
      const entityIconColor = getEntityIconColor(span.matchedEntity.entityType, span.matchedEntity.iconId);
      const EntityIcon = getEntityIcon(
        span.matchedEntity.entityType,
        `${entityIconColor} h-3 w-3`,
        span.matchedEntity.entityType === EntityType.CUSTOM ? span.matchedEntity.iconId : undefined
      );
      return EntityIcon;
    }
    const DefaultIcon = getSpanIcon(span.name);
    return <DefaultIcon className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-3 min-w-0">
        {renderSpanIcon()}
        <span className="text-xs text-muted-foreground truncate min-w-0 flex-1">{span.name}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 flex-shrink-0"
          onClick={handleCopyEvent}
          title="Copy event as JSON"
        >
          <Copy className="h-3 w-3" />
        </Button>
        {!isViewingSingleSpan && (
          <button
            type="button"
            title="Go to span in viewer"
            onClick={() => onSpanSelect(span)}
            className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
          >
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {eventName && (
        <h3 className="text-base font-bold mb-2 break-words min-w-0">{eventName}</h3>
      )}

      {eventAttributes.length > 0 ? (
        <div className="space-y-2 min-w-0">
          {eventAttributes.map((attr) => {
            const extractedValue = extractAttributeValue(attr.value);
            const valueStr =
              typeof extractedValue === 'object' && extractedValue !== null
                ? JSON.stringify(extractedValue, null, 2)
                : String(extractedValue ?? '');
            return (
              <div key={attr.key} className="flex gap-2 min-w-0 text-sm items-start">
                <div className="w-1/2 min-w-0 flex items-start gap-2 flex-shrink-0">
                  <div className="overflow-auto max-h-32 min-w-0 flex-1">
                    <span className="font-medium text-muted-foreground break-words break-all">
                      {attr.key}:
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0 mt-0.5"
                    onClick={() => copyToClipboard(attr.key, 'Attribute name')}
                    title="Copy attribute name"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="w-1/2 min-w-0 flex items-start gap-2 flex-1">
                  <div className="overflow-auto max-h-32 min-w-0 flex-1">
                    <pre className="text-xs whitespace-pre-wrap break-words font-sans text-foreground">
                      {valueStr}
                    </pre>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0 mt-0.5"
                    onClick={() => copyToClipboard(valueStr, 'Attribute value')}
                    title="Copy attribute value"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No attributes</div>
      )}
    </div>
  );

}