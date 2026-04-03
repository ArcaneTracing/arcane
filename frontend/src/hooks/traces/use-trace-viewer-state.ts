import { useState, useEffect, useMemo, useRef } from 'react';
import type { NormalizedSpan } from '@/types/traces';
import { MessageMatchingType } from '@/types';

export interface UseTraceViewerStateReturn {
  selectedSpan: NormalizedSpan | null;
  expandedNodes: Set<string>;
  activeTab: string;
  isModelSpan: boolean;
  handleSpanSelect: (span: NormalizedSpan) => void;
  toggleExpand: (spanId: string) => void;
  setActiveTab: (tab: string) => void;
}
function getSpansKey(spans: NormalizedSpan[]): string {
  return spans.map((s) => s.spanId).sort((a, b) => a.localeCompare(b)).join(',');
}

export function useTraceViewerState(
spans: NormalizedSpan[],
spanTree: NormalizedSpan[],
initialSelectedSpanId?: string | null)
: UseTraceViewerStateReturn {
  const [selectedSpan, setSelectedSpan] = useState<NormalizedSpan | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('preview');


  const spansKey = useMemo(() => getSpansKey(spans), [spans]);
  const spanTreeKey = useMemo(() => getSpansKey(spanTree), [spanTree]);
  const prevSpansKeyRef = useRef<string>('');
  const prevSpanTreeKeyRef = useRef<string>('');


  useEffect(() => {
    const spansChanged = spansKey !== prevSpansKeyRef.current;
    const treeChanged = spanTreeKey !== prevSpanTreeKeyRef.current;

    if (spans.length > 0 && (spansChanged || treeChanged)) {
      const newExpanded = new Set<string>();
      const collectAllSpanIds = (span: NormalizedSpan) => {
        if (span.children && span.children.length > 0) {
          newExpanded.add(span.spanId);
          span.children.forEach(collectAllSpanIds);
        }
      };
      spanTree.forEach(collectAllSpanIds);
      setExpandedNodes(newExpanded);
      prevSpansKeyRef.current = spansKey;
      prevSpanTreeKeyRef.current = spanTreeKey;
    }
  }, [spans.length, spansKey, spanTreeKey, spanTree]);


  useEffect(() => {
    if (initialSelectedSpanId && spans.length > 0) {
      const initialSpan = spans.find((s: NormalizedSpan) => s.spanId === initialSelectedSpanId);
      if (initialSpan && selectedSpan?.spanId !== initialSelectedSpanId) {
        setSelectedSpan(initialSpan);
      }
    }
  }, [initialSelectedSpanId, spans, selectedSpan]);


  const prevSpansKeyForSelectionRef = useRef<string>('');
  useEffect(() => {
    const spansChanged = spansKey !== prevSpansKeyForSelectionRef.current;
    if (!selectedSpan && spans.length > 0 && spansChanged && !initialSelectedSpanId) {
      setSelectedSpan(spans[0]);
      prevSpansKeyForSelectionRef.current = spansKey;
    }
  }, [spans.length, spansKey, selectedSpan, spans, initialSelectedSpanId]);

  const handleSpanSelect = (spanFromTree: NormalizedSpan) => {
    const originalSpan = spans.find((s: NormalizedSpan) => s.spanId === spanFromTree.spanId);
    if (originalSpan) {
      setSelectedSpan(originalSpan);
    } else {
      setSelectedSpan(spanFromTree);
    }
  };

  const toggleExpand = (spanId: string) => {
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(spanId)) {
        newExpanded.delete(spanId);
      } else {
        newExpanded.add(spanId);
      }
      return newExpanded;
    });
  };


  const isModelSpan = useMemo(() => {
    return !!(
    selectedSpan?.matchedEntity?.messageMatching && (
    selectedSpan.matchedEntity.messageMatching.type === MessageMatchingType.CANONICAL ||
    selectedSpan.matchedEntity.messageMatching.type === MessageMatchingType.FLAT));

  }, [selectedSpan]);


  useEffect(() => {
    if (activeTab === 'conversation' && !isModelSpan) {
      setActiveTab('preview');
    }
  }, [activeTab, isModelSpan]);

  return {
    selectedSpan,
    expandedNodes,
    activeTab,
    isModelSpan,
    handleSpanSelect,
    toggleExpand,
    setActiveTab
  };
}