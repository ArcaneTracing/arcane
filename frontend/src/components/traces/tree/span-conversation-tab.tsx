"use client";

import { useMemo } from 'react';
import { MessageMatchingType } from '@/types';
import { extractMessagesFromSpan } from '@/lib/message-matching/span-messages';
import { ConversationMessages } from '@/components/traces/conversation/conversation-messages';

import type { NormalizedSpan } from '@/types/traces';

interface SpanConversationTabProps {
  selectedSpan: NormalizedSpan | null;
}

export function SpanConversationTab({ selectedSpan }: Readonly<SpanConversationTabProps>) {

  const messages = useMemo(() => {
    if (!selectedSpan?.matchedEntity) {
      return [];
    }


    const isModelSpan = !!(
    selectedSpan.matchedEntity.messageMatching && (
    selectedSpan.matchedEntity.messageMatching.type === MessageMatchingType.CANONICAL ||
    selectedSpan.matchedEntity.messageMatching.type === MessageMatchingType.FLAT));


    if (!isModelSpan) {
      return [];
    }

    return extractMessagesFromSpan(selectedSpan, selectedSpan.matchedEntity);
  }, [selectedSpan]);

  if (!selectedSpan) {
    return (
      <ConversationMessages
        messages={[]}
        emptyMessage={{
          title: 'Select a span to view conversation'
        }} />);


  }


  const isModelSpan = !!(
  selectedSpan?.matchedEntity?.messageMatching && (
  selectedSpan.matchedEntity.messageMatching.type === MessageMatchingType.CANONICAL ||
  selectedSpan.matchedEntity.messageMatching.type === MessageMatchingType.FLAT));


  if (!isModelSpan) {
    return (
      <ConversationMessages
        messages={[]}
        emptyMessage={{
          title: 'This span is not a model span',
          description: 'Conversation view is only available for spans with message matching configured'
        }} />);


  }

  return (
    <ConversationMessages
      messages={messages}
      emptyMessage={{
        title: 'No messages found in this span',
        description: 'Make sure the span has message attributes configured'
      }} />);


}