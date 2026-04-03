import { useParams, useNavigate } from "@tanstack/react-router";
import { useAnnotationQueueQuery } from "@/hooks/annotation-queues/use-annotation-queues-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnnotatedTracesTab } from "@/components/annotation-queues/queue-view/annotated-traces-tab";
import { TracesToAnnotateTab } from "@/components/annotation-queues/queue-view/traces-to-annotate-tab";
import { AnnotatedConversationsTab } from "@/components/annotation-queues/queue-view/annotated-conversations-tab";
import { ConversationsToAnnotateTab } from "@/components/annotation-queues/queue-view/conversations-to-annotate-tab";
import { Button } from "@/components/ui/button";
import { AnnotationQueueType } from "@/types/enums";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import ForbiddenPage from "@/pages/forbidden/page";

function AnnotationQueueViewPageContent() {
  const { projectId, organisationId, queueId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/annotation-queues/$queueId", strict: false });
  const navigate = useNavigate();


  const { data: annotationQueue, isLoading: isFetchSingleLoading } = useAnnotationQueueQuery(projectId, queueId);

  if (isFetchSingleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>);

  }

  if (!annotationQueue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Queue not found</h2>
          <p className="text-muted-foreground">The annotation queue you're looking for doesn't exist.</p>
        </div>
      </div>);

  }

  return (
    <div className="flex-1 p-10 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/annotation-queues", params: { organisationId, projectId } })}
          className="mb-4">

          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Annotation Queues
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight mb-1.5">
          {annotationQueue.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {annotationQueue.description || (
          annotationQueue.type === AnnotationQueueType.CONVERSATIONS ?
          "View and manage annotated conversations and conversations to be annotated." :
          "View and manage annotated traces and traces to be annotated.")}
        </p>
      </div>

      {annotationQueue.type === AnnotationQueueType.CONVERSATIONS ?
      <Tabs defaultValue="annotated" className="w-full">
          <div className="mb-4 border-b pb-4">
            <TabsList>
              <TabsTrigger value="annotated">Annotated Conversations</TabsTrigger>
              <TabsTrigger value="to-annotate">Conversations to be Annotated</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="annotated" className="mt-0">
            <AnnotatedConversationsTab
            projectId={projectId}
            queueId={queueId}
            annotations={annotationQueue.annotations || []}
            conversations={annotationQueue.conversationsToBeAnnotated || []} />

          </TabsContent>

          <TabsContent value="to-annotate" className="mt-0">
            <ConversationsToAnnotateTab
            projectId={projectId}
            queueId={queueId}
            conversations={annotationQueue.conversationsToBeAnnotated || []} />

          </TabsContent>
        </Tabs> :

      <Tabs defaultValue="annotated" className="w-full">
          <div className="mb-4 border-b pb-4">
            <TabsList>
              <TabsTrigger value="annotated">Annotated Traces</TabsTrigger>
              <TabsTrigger value="to-annotate">Traces to be Annotated</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="annotated" className="mt-0">
            <AnnotatedTracesTab
            projectId={projectId}
            queueId={queueId}
            annotations={annotationQueue.annotations || []} />

          </TabsContent>

          <TabsContent value="to-annotate" className="mt-0">
            <TracesToAnnotateTab
            projectId={projectId}
            queueId={queueId}
            traces={annotationQueue.tracesToBeAnnotated || []} />

          </TabsContent>
        </Tabs>
      }
    </div>);

}

export default function AnnotationQueueViewPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.ANNOTATION_QUEUE.READ} fallback={<ForbiddenPage />}>
      <AnnotationQueueViewPageContent />
    </PagePermissionGuard>);

}