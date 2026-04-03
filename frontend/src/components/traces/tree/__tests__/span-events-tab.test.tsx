import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Workflow } from 'lucide-react';
import { SpanEventsTab } from '../span-events-tab';
import type { NormalizedSpan, SpanEvent } from '@/types/traces';
import { EntityType } from '@/types/enums';
import * as entityUtils from '@/lib/entity-utils';
import * as traceQueries from '@/lib/traces/queries';

jest.mock('@/lib/entity-utils');
jest.mock('@/lib/traces/queries');

const mockGetServiceName = traceQueries.getServiceName as jest.MockedFunction<typeof traceQueries.getServiceName>;
const mockGetEntityIcon = entityUtils.getEntityIcon as jest.MockedFunction<typeof entityUtils.getEntityIcon>;
const mockGetEntityIconColor = entityUtils.getEntityIconColor as jest.MockedFunction<typeof entityUtils.getEntityIconColor>;

const mockOnSpanSelect = jest.fn();

const createMockSpan = (overrides?: Partial<NormalizedSpan>): NormalizedSpan => ({
  spanId: 'span-1',
  parentSpanId: null,
  name: 'test-span',
  startTime: 1000000,
  endTime: 2000000,
  duration: 1000,
  attributes: [],
  events: [],
  resource: { serviceName: 'test-service' },
  ...overrides
});

const createMockEvent = (overrides?: Partial<SpanEvent> & {name?: string;attributes?: Array<{key: string;value: unknown;}>;}): SpanEvent & {name?: string;attributes?: Array<{key: string;value: unknown;}>;} => {
  const defaultAttributes = [{ key: 'event.name', value: { stringValue: 'test-event' } }];
  const attributes = overrides?.attributes || defaultAttributes;
  const eventName = overrides?.name || (attributes.find((a) => a.key === 'event.name' || a.key === 'name')?.value as {stringValue?: string;})?.stringValue || 'test-event';

  return {
    timestamp: 1500000,
    name: eventName,
    attributes,
    ...overrides
  };
};

describe('SpanEventsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServiceName.mockReturnValue('test-service');
    mockGetEntityIcon.mockReturnValue(<div data-testid="entity-icon">EntityIcon</div> as React.ReactElement);
    mockGetEntityIconColor.mockReturnValue('text-blue-600');
  });

  describe('Empty states', () => {
    it('shows message when no events in trace', () => {
      const spans = [createMockSpan({ events: [] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('No events found in this trace')).toBeInTheDocument();
    });

    it('shows message when no events in selected span', () => {
      const span = createMockSpan({ events: [] });
      render(
        <SpanEventsTab spans={[span]} selectedSpan={span} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('No events found in this span')).toBeInTheDocument();
    });

    it('shows filters sidebar even when no events', () => {
      const spans = [createMockSpan({ events: [] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  describe('Event collection', () => {
    it('renders events from all spans when selectedSpan is null', () => {
      const event1 = createMockEvent({ timestamp: 1000000, name: 'event1', attributes: [{ key: 'event.name', value: { stringValue: 'event1' } }] });
      const event2 = createMockEvent({ timestamp: 2000000, name: 'event2', attributes: [{ key: 'event.name', value: { stringValue: 'event2' } }] });
      const spans = [
      createMockSpan({ spanId: 's1', name: 'span1', events: [event1] }),
      createMockSpan({ spanId: 's2', name: 'span2', events: [event2] })];

      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getAllByText('span1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('span2').length).toBeGreaterThan(0);
    });

    it('renders events from selected span only when selectedSpan is provided', () => {
      const event1 = createMockEvent({ timestamp: 1000000, name: 'event1', attributes: [{ key: 'event.name', value: { stringValue: 'event1' } }] });
      const event2 = createMockEvent({ timestamp: 2000000, name: 'event2', attributes: [{ key: 'event.name', value: { stringValue: 'event2' } }] });
      const span1 = createMockSpan({ spanId: 's1', name: 'span1', events: [event1] });
      const span2 = createMockSpan({ spanId: 's2', name: 'span2', events: [event2] });
      render(
        <SpanEventsTab spans={[span1, span2]} selectedSpan={span1} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('span1')).toBeInTheDocument();
      expect(screen.queryByText('span2')).not.toBeInTheDocument();
    });

    it('collects events from nested spans recursively', () => {
      const event1 = createMockEvent({ timestamp: 1000000 });
      const event2 = createMockEvent({ timestamp: 2000000 });
      const childSpan = createMockSpan({ spanId: 's2', parentSpanId: 's1', name: 'child', events: [event2] });
      const parentSpan = createMockSpan({
        spanId: 's1',
        name: 'parent',
        events: [event1],
        children: [childSpan]
      });
      render(
        <SpanEventsTab spans={[parentSpan]} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );

      expect(screen.getAllByText('parent').length).toBeGreaterThan(0);
      expect(screen.getAllByText('child').length).toBeGreaterThan(0);
    });

    it('sorts events by timestamp', () => {
      const event1 = createMockEvent({ timestamp: 3000000 });
      const event2 = createMockEvent({ timestamp: 1000000 });
      const event3 = createMockEvent({ timestamp: 2000000 });
      const spans = [
      createMockSpan({ spanId: 's1', name: 'span1', events: [event1, event2, event3] })];

      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );

      const eventCards = screen.getAllByText('span1').filter((el) => {
        const parent = el.closest('[class*="card"]') || el.closest('[class*="bg-card"]');
        return parent !== null;
      });
      expect(eventCards.length).toBe(3);
    });
  });

  describe('Filters sidebar', () => {
    it('shows filters sidebar when viewing all spans', () => {
      const spans = [createMockSpan({ events: [createMockEvent()] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('hides filters sidebar when viewing single span', () => {
      const span = createMockSpan({ events: [createMockEvent()] });
      render(
        <SpanEventsTab spans={[span]} selectedSpan={span} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });

    it('shows span name filter when spans have different names', () => {
      const spans = [
      createMockSpan({ spanId: 's1', name: 'span1', events: [createMockEvent()] }),
      createMockSpan({ spanId: 's2', name: 'span2', events: [createMockEvent()] })];

      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByLabelText('Span Name')).toBeInTheDocument();
    });

    it('shows service name filter when spans have service names', () => {
      mockGetServiceName.mockReturnValue('service1');
      const spans = [
      createMockSpan({
        spanId: 's1',
        name: 'span1',
        events: [createMockEvent()],
        resource: { serviceName: 'service1' }
      })];

      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByLabelText('Service Name')).toBeInTheDocument();
    });

    it('shows entity filter when spans have matched entities', () => {
      const spans = [
      createMockSpan({
        spanId: 's1',
        name: 'span1',
        events: [createMockEvent()],
        matchedEntity: {
          id: 'e1',
          name: 'Test Entity',
          entityType: EntityType.MODEL,
          messageMatching: null,
          createdAt: new Date(),
          updatedAt: new Date()
        } as NormalizedSpan['matchedEntity']
      })];

      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByLabelText('Entity')).toBeInTheDocument();
    });

    it('shows event field key filter when events have attributes', () => {
      const event = createMockEvent({ attributes: [{ key: 'level', value: { stringValue: 'error' } }] });
      const spans = [createMockSpan({ events: [event] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByLabelText('Event Field Key')).toBeInTheDocument();
    });
  });
  describe('Event rendering', () => {
    it('renders event timestamp', () => {
      const event = createMockEvent({ timestamp: 1500000 });
      const spans = [createMockSpan({ events: [event] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );


      const timestampElements = screen.getAllByText((content, element) => {
        return element?.textContent?.match(/\d{1,2}\/\d{1,2}\/\d{4}/) !== null;
      });
      expect(timestampElements.length).toBeGreaterThan(0);
    });

    it('renders span name in event card', () => {
      const spans = [createMockSpan({ name: 'my-span', events: [createMockEvent()] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );

      expect(screen.getAllByText('my-span').length).toBeGreaterThan(0);
    });

    it('renders event attributes', () => {
      const event = createMockEvent({
        attributes: [
        { key: 'level', value: { stringValue: 'error' } },
        { key: 'message', value: { stringValue: 'Something went wrong' } }]

      });
      const spans = [createMockSpan({ events: [event] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('level:')).toBeInTheDocument();
      expect(screen.getByText('error')).toBeInTheDocument();
      expect(screen.getByText('message:')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders "No attributes" when event has no attributes', () => {
      const event = createMockEvent({ attributes: [] });
      const spans = [createMockSpan({ events: [event] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('No attributes')).toBeInTheDocument();
    });

    it('formats object attribute values as JSON', () => {
      const event = createMockEvent({
        attributes: [{ key: 'data', value: { nested: { value: 123 } } }]
      });
      const spans = [createMockSpan({ events: [event] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText(/"nested"/)).toBeInTheDocument();
    });
  });

  describe('Span link', () => {
    it('shows link button when viewing all spans', () => {
      const spans = [createMockSpan({ events: [createMockEvent()] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );

      const linkButton = screen.getByRole('button', { name: /go to span in viewer/i });
      expect(linkButton).toBeInTheDocument();
      expect(linkButton).toHaveAttribute('title', 'Go to span in viewer');
    });

    it('hides link button when viewing single span', () => {
      const span = createMockSpan({ events: [createMockEvent()] });
      render(
        <SpanEventsTab spans={[span]} selectedSpan={span} onSpanSelect={mockOnSpanSelect} />
      );

      const linkButton = screen.queryByRole('button', { name: /go to span in viewer/i });
      expect(linkButton).not.toBeInTheDocument();
    });

    it('calls onSpanSelect when link is clicked', async () => {
      const span = createMockSpan({ events: [createMockEvent()] });
      render(
        <SpanEventsTab spans={[span]} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );

      const linkButton = screen.getByRole('button', { name: /go to span in viewer/i });
      expect(linkButton).toBeInTheDocument();
      await userEvent.click(linkButton);
      expect(mockOnSpanSelect).toHaveBeenCalledWith(span);
    });
  });

  describe('Icon rendering', () => {
    it('renders entity icon when span has matched entity', () => {
      const span = createMockSpan({
        events: [createMockEvent()],
        matchedEntity: {
          id: 'e1',
          name: 'Entity',
          entityType: EntityType.MODEL,
          messageMatching: null,
          createdAt: new Date(),
          updatedAt: new Date()
        } as NormalizedSpan['matchedEntity']
      });
      render(
        <SpanEventsTab spans={[span]} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(mockGetEntityIcon).toHaveBeenCalled();
      expect(screen.getByTestId('entity-icon')).toBeInTheDocument();
    });

    it('renders default span icon when span has no matched entity', () => {
      const span = createMockSpan({
        events: [createMockEvent()],
        matchedEntity: null
      });
      render(
        <SpanEventsTab spans={[span]} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(mockGetEntityIcon).not.toHaveBeenCalled();

    });
  });

  describe('Field formatting', () => {
    it('handles array attributes', () => {
      const event = createMockEvent({
        attributes: [{ key: 'tags', value: { arrayValue: { values: [{ stringValue: 'tag1' }, { stringValue: 'tag2' }] } } }]
      });
      const spans = [createMockSpan({ events: [event] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('tags:')).toBeInTheDocument();
    });

    it('handles object attributes', () => {
      const event = createMockEvent({
        attributes: [{ key: 'metadata', value: { kvlistValue: { values: [{ key: 'key', value: { stringValue: 'value' } }] } } }]
      });
      const spans = [createMockSpan({ events: [event] })];
      render(
        <SpanEventsTab spans={spans} selectedSpan={null} onSpanSelect={mockOnSpanSelect} />
      );
      expect(screen.getByText('metadata:')).toBeInTheDocument();
    });
  });
});