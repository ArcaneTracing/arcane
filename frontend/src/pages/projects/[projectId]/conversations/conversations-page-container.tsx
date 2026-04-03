"use client"

import { useParams } from "@tanstack/react-router"
import { useDatasourcesListQuery } from "@/hooks/datasources/use-datasources-query"
import { useConversationConfigurationsQuery } from "@/hooks/conversation/use-conversation-query"
import { useConversations } from "@/hooks/conversation/use-conversations"
import { useConversationsUrlState, calculateDatesFromLookback } from "@/hooks/conversation/use-conversations-url-state"
import { usePermissions } from "@/hooks/usePermissions"
import { PERMISSIONS } from "@/lib/permissions"
import { isForbiddenError } from "@/lib/error-handling"
import { ConversationsPageView } from "./conversations-page-view"

export function ConversationsPageContainer() {
  const { projectId, organisationId } = useParams({
    from: "/appLayout/organisations/$organisationId/projects/$projectId/conversations",
    strict: false,
  })

  const { hasPermission, isLoading: permissionsLoading } = usePermissions({
    organisationId,
    projectId,
  })

  const canReadDatasources = !permissionsLoading && hasPermission(PERMISSIONS.DATASOURCE.READ)

  const urlState = useConversationsUrlState()

  const { data: datasources = [], isLoading: isFetchLoading, error: datasourcesError } =
    useDatasourcesListQuery({ enabled: canReadDatasources })
  const { data: configurations = [], isLoading: isConfigLoading, error: configsError } =
    useConversationConfigurationsQuery()
  const { conversations, isSearchLoading, searchError, searchConversations } = useConversations()

  const hasDatasourcesPermissionError =
    !canReadDatasources || (datasourcesError && isForbiddenError(datasourcesError))
  const hasConfigsPermissionError = configsError && isForbiddenError(configsError)
  const traceDatasources = datasources.filter((ds) => ds.type === "traces")

  const handleSearch = () => {
    if (!organisationId || !projectId || !urlState.datasourceId || !urlState.conversationConfigId) {
      return
    }
    let searchStart: Date
    let searchEnd: Date
    if (urlState.lookback && urlState.lookback !== "custom") {
      const { startDate: calculatedStart, endDate: calculatedEnd } = calculateDatesFromLookback(
        urlState.lookback
      )
      searchStart = calculatedStart
      searchEnd = calculatedEnd
    } else {
      if (!urlState.startDate || !urlState.endDate) return
      searchStart = urlState.startDate
      searchEnd = urlState.endDate
    }
    searchConversations({
      organisationId,
      projectId,
      datasourceId: urlState.datasourceId,
      conversationConfigId: urlState.conversationConfigId,
      start: searchStart.toISOString(),
      end: searchEnd.toISOString(),
    })
  }

  return (
    <ConversationsPageView
      traceDatasources={traceDatasources}
      configurations={configurations}
      isFetchLoading={isFetchLoading}
      isConfigLoading={isConfigLoading}
      hasDatasourcesPermissionError={!!hasDatasourcesPermissionError}
      hasConfigsPermissionError={!!hasConfigsPermissionError}
      urlState={urlState}
      onSearch={handleSearch}
      isSearchLoading={isSearchLoading}
      conversations={conversations}
      searchError={searchError}
    />
  )
}
