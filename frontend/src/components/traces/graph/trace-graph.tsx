"use client";

import {
  ReactFlow,
  Controls,
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState } from
'@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';
import TraceSpanNode from '@/components/traces/graph/nodes/trace-span-node';
import { ComponentErrorBoundary } from '@/components/ComponentErrorBoundary';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createTraceNodes, extractTraceId } from '@/lib/trace-utils';
import { useEntitiesQuery } from '@/hooks/entities/use-entities-query';
import type { TempoTraceResponse } from '@/types/traces';

const nodeTypes = {
  span: TraceSpanNode
};

interface FlowProps {
  trace: TempoTraceResponse | Record<string, unknown> | null | undefined;
  traceId?: string;
}

function Flow({ trace, traceId }: Readonly<FlowProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const { data: entities = [] } = useEntitiesQuery();
  const { resolvedTheme } = useTheme();
  const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light';


  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    updateSize();
    globalThis.addEventListener('resize', updateSize);
    const timeout = setTimeout(updateSize, 100);
    return () => {
      globalThis.removeEventListener('resize', updateSize);
      clearTimeout(timeout);
    };
  }, []);


  const initialGraph = useMemo(
    () => createTraceNodes(trace, entities || []),
    [trace, entities]
  );

  const [nodes, , onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, , onEdgesChange] = useEdgesState(initialGraph.edges);

  if (containerSize.width === 0 || containerSize.height === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          position: 'relative'
        }}>

        <div className="flex items-center justify-center h-full">
          <p>Loading graph...</p>
        </div>
      </div>);

  }

  return (
    <ComponentErrorBoundary
      resetKeys={[trace, entities.length]}
      scope="TraceGraph">

      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          height: '100%',
          position: 'relative',
          width: '100%',
          overflow: 'hidden'
        }}>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          className="bg-background"
          colorMode={colorMode}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          attributionPosition="bottom-right">

          <Background color="#aaa" gap={16} />
          <Controls showInteractive={true} />
        </ReactFlow>
      </div>
    </ComponentErrorBoundary>);

}

interface TraceGraphProps {
  trace: TempoTraceResponse | Record<string, unknown> | null | undefined;
  traceId?: string;
}

export function TraceGraph({ trace, traceId }: Readonly<TraceGraphProps>) {
  return (
    <ReactFlowProvider>
      <Flow key={traceId ?? extractTraceId(trace)} trace={trace} traceId={traceId} />
    </ReactFlowProvider>);

}