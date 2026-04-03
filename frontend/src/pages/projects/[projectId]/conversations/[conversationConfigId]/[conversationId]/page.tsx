import { TraceViewer } from "@/components/traces/tree/trace-viewer";
import { TraceConversation } from "@/components/traces/conversation/trace-conversation";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate, useLocation, useSearch } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { mergeTraces, getAllServiceNamesFromTrace, extractSpansFromTrace, getServiceName, traceIdForUrl } from "@/lib/trace-utils";
import { useFullConversation } from "@/hooks/conversation/use-full-conversation";
import { AnnotateConversationDrawer } from "@/components/traces/tree/annotate-conversation-drawer";
import { AnnotateTraceDrawer } from "@/components/traces/tree/annotate-trace-drawer";
import { PERMISSIONS } from "@/lib/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import { AddConversationToQueueDialog } from "@/components/conversations/add-conversation-to-queue-dialog";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import ForbiddenPage from "@/pages/forbidden/page";

export function ConversationDetailPageContent() {
  const { projectId, organisationId, conversationConfigId, conversationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/conversations/$conversationConfigId/$conversationId", strict: false });
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearch({ strict: false });


  const urlSearchParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      datasourceId: params.get("datasourceId") || undefined,
      start: params.get("start") || undefined,
      end: params.get("end") || undefined,
      visualization: params.get("visualization") || undefined
    };
  }, [location.search]);


  const mergedSearch = useMemo(() => ({
    ...urlSearchParams,
    ...search
  }), [search, urlSearchParams]);

  useEffect(() => {
    if (!mergedSearch.visualization) {

      navigate({
        to: location.pathname as any,
        search: { ...mergedSearch, visualization: "conversation" } as any,
        replace: true
      });
    }
  }, [mergedSearch, navigate, location.pathname]);

  const [visualizationType, setVisualizationType] = useState(
    mergedSearch.visualization || "conversation"
  );
  const [isAnnotateDrawerOpen, setIsAnnotateDrawerOpen] = useState(false);
  const [isAnnotateTraceDrawerOpen, setIsAnnotateTraceDrawerOpen] = useState(false);
  const [selectedAnnotateTraceId, setSelectedAnnotateTraceId] = useState<string | null>(null);
  const [expandedTraceIndex, setExpandedTraceIndex] = useState<number | null>(null);

  const { traces, isFetchLoading, fetchError, fetchFullConversation } = useFullConversation();


  const datasourceId = mergedSearch.datasourceId || "";
  const start = mergedSearch.start || undefined;
  const end = mergedSearch.end || undefined;


  const lastFetchParamsRef = useRef<string>("");

  useEffect(() => {
    if (!organisationId || !conversationId || !conversationConfigId || !projectId || !datasourceId || !start || !end) {
      return;
    }

    const fetchKey = `${organisationId}-${projectId}-${datasourceId}-${conversationConfigId}-${conversationId}-${start}-${end}`;

    if (lastFetchParamsRef.current === fetchKey) {
      return;
    }

    lastFetchParamsRef.current = fetchKey;

    fetchFullConversation({
      organisationId,
      projectId,
      datasourceId,
      conversationConfigId,
      value: conversationId,
      start,
      end
    }).catch(() => {
      lastFetchParamsRef.current = "";
    });
  }, [organisationId, conversationId, conversationConfigId, projectId, datasourceId, start, end, fetchFullConversation]);


  useEffect(() => {
    if (traces && traces.length > 0) {
      setExpandedTraceIndex(0);
    }
  }, [traces]);


  const mergedTrace = useMemo(() => {
    if (!traces || traces.length === 0) return null;
    return mergeTraces(traces);
  }, [traces]);


  const traceList = useMemo(() => {
    if (!traces || traces.length === 0) return [];
    return traces.map((trace, index) => {

      let traceId = trace.traceId || trace.traceID || trace.id;


      if (!traceId) {
        const spanData = extractSpansFromTrace(trace);
        const firstSpan = spanData[0]?.span;
        traceId = firstSpan?.traceId || firstSpan?.trace_id || `trace-${index}`;
      }

      const spanData = extractSpansFromTrace(trace);
      const firstSpan = spanData[0]?.span;
      const resource = spanData[0]?.resource || trace.resource || {};
      const serviceName = getServiceName(resource);


      let minStart: number | null = null;
      let maxEnd: number | null = null;

      spanData.forEach(({ span }: {span: any;}) => {
        let start: number | null = null;
        let end: number | null = null;

        if (span.startTimeUnixNano) {
          start = Number(span.startTimeUnixNano) / 1000000;
        } else if (span.startTime) {
          start = span.startTime;
        }

        if (span.endTimeUnixNano) {
          end = Number(span.endTimeUnixNano) / 1000000;
        } else if (span.endTime) {
          end = span.endTime;
        }

        if (start !== null && (minStart === null || start < minStart)) {
          minStart = start;
        }
        if (end !== null && (maxEnd === null || end > maxEnd)) {
          maxEnd = end;
        }
      });

      const duration = minStart && maxEnd ? maxEnd - minStart : 0;
      const rootSpanName = firstSpan?.name || 'Unknown';
      const rawTraceId = traceId || `trace-${index}`;

      return {
        traceId: traceIdForUrl(rawTraceId),
        rawTraceId,
        serviceName,
        rootSpanName,
        startTime: minStart,
        duration,
        spanCount: spanData.length
      };
    });
  }, [traces]);


  const allServiceNames = useMemo(() => {
    if (!mergedTrace) return [];
    return getAllServiceNamesFromTrace(mergedTrace);
  }, [mergedTrace]);

  const handleTraceClick = (index: number) => {
    setExpandedTraceIndex(expandedTraceIndex === index ? null : index);
  };

  const handleTraceDoubleClick = (traceId: string) => {
    navigate({
      to: "/organisations/$organisationId/projects/$projectId/traces/$datasourceId/$traceId",
      params: { organisationId, projectId, datasourceId, traceId }
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };


  if (isFetchLoading && traces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>);

  }

  if (fetchError || !mergedTrace || traces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">
          {fetchError ? `Error: ${fetchError}` : "Conversation not found"}
        </div>
      </div>);

  }

  return (
    <div className="flex h-full flex-col pt-6 pl-4">
      {}
      <div className="flex-1 border-r flex flex-col overflow-hidden">
        <div className="border-b p-4 bg-background flex-shrink-0 z-10">
          <div className="px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/conversations", params: { organisationId, projectId } })}
              className="mb-4">

              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Conversations
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Conversation: {conversationId}
                </h2>
                {allServiceNames.length > 0 &&
                <p className="text-sm text-muted-foreground mt-1">
                    {allServiceNames.join(', ')}
                  </p>
                }
                <p className="text-sm text-muted-foreground mt-1">
                  {traces.length} trace{traces.length === 1 ? '' : 's'} merged
                </p>
              </div>
              <div className="flex gap-2">
                <PermissionGuard
                  permission={PERMISSIONS.ANNOTATION_QUEUE.CONVERSATIONS_CREATE}
                  organisationId={organisationId}
                  projectId={projectId}>

                  {projectId && datasourceId && conversationConfigId && traces.length > 0 &&
                  <AddConversationToQueueDialog
                    selectedConversations={new Set([conversationId])}
                    conversations={[{
                      conversationId,
                      name: conversationId,
                      traceIds: traceList.map((t) => t.rawTraceId),
                      traceCount: traces.length
                    }]}
                    projectId={projectId}
                    datasourceId={datasourceId}
                    conversationConfigId={conversationConfigId}
                    startDate={start ? new Date(start) : undefined}
                    endDate={end ? new Date(end) : undefined}
                    decodeTraceIds
                    trigger={
                    <Button variant="outline" size="sm">
                          Add to Annotation Queue
                        </Button>
                    } />

                  }
                </PermissionGuard>
                <PermissionGuard
                  permission={PERMISSIONS.ANNOTATION_QUEUE.CONVERSATIONS_CREATE}
                  organisationId={organisationId}
                  projectId={projectId}>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsAnnotateDrawerOpen(true)}>

                    Annotate Conversation
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </div>
          <Tabs
            value={visualizationType}
            onValueChange={(value) => {
              setVisualizationType(value);

              navigate({
                to: location.pathname as any,
                search: { ...mergedSearch, visualization: value } as any,
                replace: true
              });
            }}
            className="mt-4">

            <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="traces">List</TabsTrigger>
              <TabsTrigger value="viewer">Trace</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden">
            {visualizationType === "traces" &&
            <div className="h-full overflow-auto">
                <div className="p-4 space-y-3">
                  {traceList.map((trace, index) => {
                  const isExpanded = expandedTraceIndex === index;
                  const traceData = traces[index];

                  return (
                    <div
                      key={trace.traceId || index}
                      className={`border rounded-lg overflow-hidden transition-colors shadow-sm ${
                      isExpanded ?
                      'border-primary' :
                      'border-border hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50'}`
                      }>

                        {}
                        {isExpanded && traceData ?
                      <div className="flex h-[300px] max-h-[300px]">
                            {}
                            <div className="flex-[2] border-r overflow-auto">
                              <div className="scale-90 origin-top-left" style={{ width: '111.11%', minHeight: '300px' }}>
                                <TraceConversation trace={traceData} />
                              </div>
                            </div>
                            
                            {}
                            <div className="flex-1 overflow-y-auto p-3">
                              <button
                            type="button"
                            className="w-full text-left cursor-pointer mb-3 bg-transparent border-0 p-0"
                            onClick={() => handleTraceClick(index)}
                            onDoubleClick={() => handleTraceDoubleClick(trace.traceId)}>

                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-[12px] text-foreground">{trace.rootSpanName}</div>
                                  <div className="text-[12px] text-gray-500 dark:text-gray-400">#{trace.traceId}</div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1.5">
                                  {trace.startTime &&
                              <div className="inline-flex items-center gap-1.5">
                                      <span>{new Date(trace.startTime).toLocaleString()}</span>
                                    </div>
                              }
                                  {trace.duration > 0 &&
                              <div className="inline-flex items-center gap-1.5">
                                      <span>{formatDuration(trace.duration)}</span>
                                    </div>
                              }
                                  <div className="inline-flex items-center gap-1.5">
                                    <span>{trace.spanCount} span{trace.spanCount === 1 ? '' : 's'}</span>
                                  </div>
                                </div>
                                
                                {!trace.serviceName || trace.serviceName === 'unknown' ? null :
                            <>
                                    <div className="h-px bg-border my-2" />
                                    <div className="flex flex-wrap gap-2">
                                      <div className="inline-flex items-center gap-2 py-0.5 px-1.5 bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-white rounded text-[10px]">
                                        <span className="font-medium">{trace.serviceName}</span>
                                      </div>
                                    </div>
                                  </>
                            }
                              </button>
                              
                              {}
                              <div className="mt-3">
                                <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-[11px] h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                globalThis.open(`/organisations/${organisationId}/projects/${projectId}/traces/${datasourceId}/${trace.traceId}`, '_blank');
                              }}>

                                  View Trace
                                </Button>
                              </div>

                              <PermissionGuard
                            permission={PERMISSIONS.ANNOTATION_QUEUE.TRACES_CREATE}
                            organisationId={organisationId}
                            projectId={projectId}>

                                <div className="mt-2">
                                  <Button
                                variant="default"
                                size="sm"
                                className="w-full text-[11px] h-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAnnotateTraceId(trace.traceId);
                                  setIsAnnotateTraceDrawerOpen(true);
                                }}>

                                    Annotate
                                  </Button>
                                </div>
                              </PermissionGuard>
                            </div>
                          </div> : (


                      <button
                        type="button"
                        className="w-full text-left p-4 cursor-pointer bg-transparent border-0"
                        onClick={() => handleTraceClick(index)}
                        onDoubleClick={() => handleTraceDoubleClick(trace.traceId)}>

                            <div className="flex items-center gap-2">
                              <div className="font-medium text-[13px] text-foreground">{trace.rootSpanName}</div>
                              <div className="text-[13px] text-gray-500 dark:text-gray-400">#{trace.traceId}</div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-2">
                              {trace.startTime &&
                          <div className="inline-flex items-center gap-1.5">
                                  <span>{new Date(trace.startTime).toLocaleString()}</span>
                                </div>
                          }
                              {trace.duration > 0 &&
                          <div className="inline-flex items-center gap-1.5">
                                  <span>{formatDuration(trace.duration)}</span>
                                </div>
                          }
                              <div className="inline-flex items-center gap-1.5">
                                <span>{trace.spanCount} span{trace.spanCount === 1 ? '' : 's'}</span>
                              </div>
                            </div>
                            
                            {!trace.serviceName || trace.serviceName === 'unknown' ? null :
                        <>
                                <div className="h-px bg-border my-3" />
                                <div className="flex flex-wrap gap-2">
                                  <div className="inline-flex items-center gap-2 py-1 px-2 bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-white rounded text-[11px]">
                                    <span className="font-medium">{trace.serviceName}</span>
                                  </div>
                                </div>
                              </>
                        }
                          </button>)
                      }
                      </div>);

                })}
                </div>
              </div>
            }
            {visualizationType === "viewer" &&
            <TraceViewer
              trace={mergedTrace}
              traceId={`conversation-${conversationId}`}
              showAddToAnnotationQueue={false}
              showAddToDataset={false} />

            }
            {visualizationType === "conversation" &&
            <TraceConversation trace={mergedTrace} />
            }
          </div>
        </div>
      </div>

      {}
      {projectId && conversationId && datasourceId && conversationConfigId && traces.length > 0 &&
      <AnnotateConversationDrawer
        projectId={projectId}
        conversationId={conversationId}
        conversationConfigId={conversationConfigId}
        datasourceId={datasourceId}
        traceIds={traceList.map((t) => t.rawTraceId)}
        startDate={start}
        endDate={end}
        isOpen={isAnnotateDrawerOpen}
        onClose={() => setIsAnnotateDrawerOpen(false)} />

      }

      {}
      {projectId && selectedAnnotateTraceId &&
      <AnnotateTraceDrawer
        projectId={projectId}
        traceId={selectedAnnotateTraceId}
        datasourceId={datasourceId || undefined}
        startDate={start}
        endDate={end}
        isOpen={isAnnotateTraceDrawerOpen}
        onClose={() => {
          setIsAnnotateTraceDrawerOpen(false);
          setSelectedAnnotateTraceId(null);
        }} />

      }
    </div>);

}

export default function ConversationDetailPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.CONVERSATION.READ} fallback={<ForbiddenPage />}>
      <ConversationDetailPageContent />
    </PagePermissionGuard>);

}