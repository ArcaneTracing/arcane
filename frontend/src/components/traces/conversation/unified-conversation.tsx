"use client";

import { useMemo } from 'react';
import { extractCanonicalMessagesFromTrace } from '@/lib/message-matching/canonical/matching';
import { extractFlatMessagesFromTrace } from '@/lib/message-matching/flat/matching';
import { MessageMatchingType } from '@/types';
import { useEntitiesQuery } from '@/hooks/entities/use-entities-query';
import { ExtractedMessage } from '@/lib/message-matching/shared';
import { ConversationMessages } from './conversation-messages';
import type { TempoTraceResponse } from '@/types/traces';

interface UnifiedConversationProps {
  trace: TempoTraceResponse | Record<string, unknown> | null | undefined;
}

export function UnifiedConversation({ trace }: Readonly<UnifiedConversationProps>) {

  const { data: entities = [] } = useEntitiesQuery();


  const messages = useMemo(() => {
    if (!trace || !entities || entities.length === 0) {
      return [];
    }


    const hasCanonical = entities.some(
      (entity) =>
      entity.messageMatching?.type === MessageMatchingType.CANONICAL &&
      entity.messageMatching?.canonicalMessageMatchingConfiguration
    );
    const hasFlat = entities.some(
      (entity) =>
      entity.messageMatching?.type === MessageMatchingType.FLAT &&
      entity.messageMatching?.flatMessageMatchingConfiguration
    );

    const allMessages: ExtractedMessage[] = [];


    if (hasCanonical) {
      const canonicalMessages = extractCanonicalMessagesFromTrace(trace, entities);
      allMessages.push(...canonicalMessages);
    }

    if (hasFlat) {
      const flatMessages = extractFlatMessagesFromTrace(trace, entities);
      allMessages.push(...flatMessages);
    }


    const seen = new Set<string>();
    const uniqueMessages: ExtractedMessage[] = [];

    for (const message of allMessages) {
      const key = `${message.spanId}-${message.content}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMessages.push(message);
      }
    }


    return uniqueMessages.sort((a, b) => a.timestamp - b.timestamp);
  }, [trace, entities]);

  return (
    <ConversationMessages
      messages={messages}
      emptyMessage={{
        title: 'No messages found in this trace',
        description: 'Make sure entities with message matching are configured'
      }} />);


}