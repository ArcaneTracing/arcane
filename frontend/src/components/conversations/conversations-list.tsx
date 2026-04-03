"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, MessageCircle, Eye } from "lucide-react";
import { ConversationListItemResponse } from "@/types/conversations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
"@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "@tanstack/react-router";
import { AddConversationToQueueDialog } from "@/components/conversations/add-conversation-to-queue-dialog";
import { calculateDatesFromLookback } from "@/hooks/conversation/use-conversations-url-state";

interface ConversationsListProps {
  conversations: ConversationListItemResponse[];
  isLoading: boolean;
  error: string | null;
  datasourceId: string;
  conversationConfigId: string;
  startDate?: Date;
  endDate?: Date;
  lookback?: string;
}

export function ConversationsList({
  conversations,
  isLoading,
  error,
  datasourceId,
  conversationConfigId,
  startDate,
  endDate,
  lookback
}: Readonly<ConversationsListProps>) {
  const navigate = useNavigate();
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/conversations", strict: false });

  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    setSelectedConversations(new Set());
  }, [conversations]);


  const isAllSelected = conversations.length > 0 && selectedConversations.size === conversations.length;
  const isIndeterminate = selectedConversations.size > 0 && selectedConversations.size < conversations.length;


  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const input = selectAllCheckboxRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (input) {
        input.indeterminate = isIndeterminate;
      }
    }
  }, [isIndeterminate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>);

  }

  if (error) {
    return (
      <div className="text-destructive p-4">Error: {error}</div>);

  }

  if (conversations.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No conversations found</div>);

  }

  const handleSelectConversation = (conversationId: string, checked: boolean) => {
    setSelectedConversations((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(conversationId);
      } else {
        newSet.delete(conversationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allConversationIds = new Set(conversations.map((conv) => conv.conversationId).filter(Boolean));
    setSelectedConversations(allConversationIds);
  };

  const handleDeselectAll = () => {
    setSelectedConversations(new Set());
  };

  const handleViewConversation = (conversation: ConversationListItemResponse) => {


    const searchParams: Record<string, string> = {
      datasourceId
    };


    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (!finalStartDate || !finalEndDate) {
      if (lookback && lookback !== "custom") {
        const { startDate: calculatedStart, endDate: calculatedEnd } = calculateDatesFromLookback(lookback);
        finalStartDate = calculatedStart;
        finalEndDate = calculatedEnd;
      }
    }

    if (finalStartDate) {
      searchParams.start = finalStartDate.toISOString();
    }
    if (finalEndDate) {
      searchParams.end = finalEndDate.toISOString();
    }

    if (!organisationId) return;
    navigate({
      to: "/organisations/$organisationId/projects/$projectId/conversations/$conversationConfigId/$conversationId",
      params: {
        organisationId,
        projectId,
        conversationConfigId,
        conversationId: conversation.conversationId
      },
      search: searchParams
    });
  };

  const handleAddToQueueSuccess = () => {
    setSelectedConversations(new Set());
  };

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      {selectedConversations.size > 0 &&
      <div className="border-b border-border p-3 bg-muted/50 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedConversations.size} conversation{selectedConversations.size === 1 ? '' : 's'} selected
          </div>
          <AddConversationToQueueDialog
          selectedConversations={selectedConversations}
          conversations={conversations}
          projectId={projectId}
          datasourceId={datasourceId}
          conversationConfigId={conversationConfigId}
          startDate={startDate}
          endDate={endDate}
          onSuccess={handleAddToQueueSuccess} />

        </div>
      }
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  ref={selectAllCheckboxRef}
                  checked={isAllSelected}
                  onCheckedChange={(checked) => (checked ? handleSelectAll : handleDeselectAll)()} />

              </TableHead>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Trace Count</TableHead>
              <TableHead>Trace IDs</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((conversation, index) => {
              const traceIds = conversation.traceIds || [];
              const hasTraceIds = traceIds.length > 0;
              const traceCount = Number.isFinite(conversation.traceCount) ?
              conversation.traceCount :
              traceIds.length;
              const isSelected = selectedConversations.has(conversation.conversationId);

              const rowKey = `conv-${conversation.conversationId}-${index}`;

              return (
                <TableRow key={rowKey}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                      handleSelectConversation(conversation.conversationId, checked as boolean)
                      } />

                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-[13px] text-foreground">
                        {conversation.name || conversation.conversationId}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        #{conversation.conversationId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      <span className="translate-y-[0.5px]">{traceCount} trace{traceCount === 1 ? '' : 's'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {hasTraceIds ?
                    <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-[11px] text-muted-foreground cursor-help max-w-md">
                              <div className="font-mono truncate">
                                {traceIds.length === 1 ?
                              <span>{traceIds[0].length > 40 ? `${traceIds[0].substring(0, 40)}...` : traceIds[0]}</span> :

                              <span>
                                    {traceIds[0].length > 30 ? `${traceIds[0].substring(0, 30)}...` : traceIds[0]}
                                    {traceIds.length > 1 &&
                                <span className="text-muted-foreground/70"> (+{traceIds.length - 1} more)</span>
                                }
                                  </span>
                              }
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1 text-xs">
                              <div className="font-semibold text-foreground mb-1">Trace IDs</div>
                              {traceIds.map((traceId) =>
                            <div key={traceId} className="font-mono break-all text-muted-foreground">
                                  {traceId}
                                </div>
                            )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider> :

                    <span className="text-[11px] text-muted-foreground">No trace IDs</span>
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewConversation(conversation)}
                      className="h-7 text-[11px]">

                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>);

            })}
          </TableBody>
        </Table>
      </div>
    </div>);

}