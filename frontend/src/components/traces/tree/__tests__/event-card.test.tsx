import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventCard } from '../event-card';
import type { NormalizedSpan, SpanEvent } from '@/types/traces';
import { EntityType } from '@/types/enums';
import * as entityUtils from '@/lib/entity-utils';
import * as traceViewerUtils from '../trace-viewer-utils';

jest.mock('@/lib/entity-utils');
jest.mock('../trace-viewer-utils');

const mockGetEntityIcon = entityUtils.getEntityIcon as jest.MockedFunction<typeof entityUtils.getEntityIcon>;
const mockGetEntityIconColor = entityUtils.getEntityIconColor as jest.MockedFunction<typeof entityUtils.getEntityIconColor>;
const mockGetSpanIcon = traceViewerUtils.getSpanIcon as jest.MockedFunction<typeof traceViewerUtils.getSpanIcon>;

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
  return {
    timestamp: 1500000,
    name: 'test-event',
    attributes: [],
    ...overrides
  };
};

describe('EventCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEntityIconColor.mockReturnValue('text-blue-600');
    mockGetEntityIcon.mockReturnValue(<div data-testid="entity-icon">EntityIcon</div> as React.ReactElement);
    mockGetSpanIcon.mockReturnValue(() => <div data-testid="span-icon">SpanIcon</div>);
  });

  describe('Go to span button', () => {
    it('renders button when not viewing single span', () => {
      const span = createMockSpan();
      const event = createMockEvent();
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      const button = screen.getByRole('button', { name: /go to span in viewer/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Go to span in viewer');
    });

    it('does not render button when viewing single span', () => {
      const span = createMockSpan();
      const event = createMockEvent();
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={true}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      const button = screen.queryByRole('button', { name: /go to span in viewer/i });
      expect(button).not.toBeInTheDocument();
    });

    it('calls onSpanSelect when button is clicked', async () => {
      const user = userEvent.setup();
      const span = createMockSpan();
      const event = createMockEvent();
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      const button = screen.getByRole('button', { name: /go to span in viewer/i });
      await user.click(button);
      
      expect(mockOnSpanSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSpanSelect).toHaveBeenCalledWith(span);
    });

    it('button has correct styling classes', () => {
      const span = createMockSpan();
      const event = createMockEvent();
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      const button = screen.getByRole('button', { name: /go to span in viewer/i });
      expect(button).toHaveClass('text-primary');
      expect(button).toHaveClass('hover:text-primary/80');
      expect(button).toHaveClass('transition-colors');
    });
  });

  describe('Event name rendering', () => {
    it('renders event name when present', () => {
      const span = createMockSpan();
      const event = createMockEvent({ name: 'custom-event' });
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      expect(screen.getByText('custom-event')).toBeInTheDocument();
    });

    it('does not render event name heading when name is null', () => {
      const span = createMockSpan();
      const event = createMockEvent({ name: null });
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      const headings = screen.queryAllByRole('heading');
      expect(headings.length).toBe(0);
    });
  });

  describe('Event attributes rendering', () => {
    it('renders attributes when present', () => {
      const span = createMockSpan();
      const event = createMockEvent({
        attributes: [
          { key: 'attr1', value: { stringValue: 'value1' } },
          { key: 'attr2', value: { intValue: 42 } }
        ]
      });
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      expect(screen.getByText(/attr1:/i)).toBeInTheDocument();
      expect(screen.getByText(/attr2:/i)).toBeInTheDocument();
    });

    it('shows "No attributes" message when attributes array is empty', () => {
      const span = createMockSpan();
      const event = createMockEvent({ attributes: [] });
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      expect(screen.getByText('No attributes')).toBeInTheDocument();
    });
  });

  describe('Span icon rendering', () => {
    it('renders entity icon when span has matched entity', () => {
      const span = createMockSpan({
        matchedEntity: {
          id: 'e1',
          name: 'Entity',
          entityType: EntityType.MODEL,
          messageMatching: null,
          createdAt: new Date(),
          updatedAt: new Date()
        } as NormalizedSpan['matchedEntity']
      });
      const event = createMockEvent();
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      expect(mockGetEntityIcon).toHaveBeenCalled();
      expect(screen.getByTestId('entity-icon')).toBeInTheDocument();
    });

    it('renders default span icon when span has no matched entity', () => {
      const span = createMockSpan({ matchedEntity: null });
      const event = createMockEvent();
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      expect(mockGetSpanIcon).toHaveBeenCalledWith(span.name);
      expect(screen.getByTestId('span-icon')).toBeInTheDocument();
    });
  });

  describe('Span name rendering', () => {
    it('renders span name', () => {
      const span = createMockSpan({ name: 'my-span' });
      const event = createMockEvent();
      
      render(
        <EventCard
          event={event}
          span={span}
          isViewingSingleSpan={false}
          onSpanSelect={mockOnSpanSelect}
        />
      );

      expect(screen.getByText('my-span')).toBeInTheDocument();
    });
  });
});
