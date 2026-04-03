"use client"

import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConversationsList } from "@/components/conversations/conversations-list"
import { lookbackOptions } from "@/lib/lookback-utils"
import type { UseConversationsUrlStateReturn } from "@/hooks/conversation/use-conversations-url-state"
import type { DatasourceListItemResponse } from "@/types/datasources"
import type { ConversationConfigurationResponse } from "@/types/conversation-configuration"
import type { ConversationListItemResponse } from "@/types/conversations"

export interface ConversationsPageViewProps {
  traceDatasources: DatasourceListItemResponse[]
  configurations: ConversationConfigurationResponse[]
  isFetchLoading: boolean
  isConfigLoading: boolean
  hasDatasourcesPermissionError: boolean
  hasConfigsPermissionError: boolean
  urlState: UseConversationsUrlStateReturn
  onSearch: () => void
  isSearchLoading: boolean
  conversations: ConversationListItemResponse[]
  searchError: string | null
}

export function ConversationsPageView({
  traceDatasources,
  configurations,
  isFetchLoading,
  isConfigLoading,
  hasDatasourcesPermissionError,
  hasConfigsPermissionError,
  urlState,
  onSearch,
  isSearchLoading,
  conversations,
  searchError,
}: Readonly<ConversationsPageViewProps>) {
  return (
    <div className="flex-1 p-10">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Conversations</h1>
          <p className="text-sm text-muted-foreground/60">
            View and filter conversations by date range.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label
                htmlFor="datasource"
                className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Datasource:
              </label>
              <Select
                value={urlState.datasourceId}
                onValueChange={urlState.handleDatasourceChange}
                disabled={isFetchLoading || hasDatasourcesPermissionError}
              >
                <SelectTrigger id="datasource" className="w-[200px] h-8">
                  <SelectValue
                    placeholder={
                      hasDatasourcesPermissionError ? "No permission" : "Select datasource"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    if (hasDatasourcesPermissionError) {
                      return (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          You don&apos;t have permission to view datasources
                        </div>
                      )
                    }
                    if (traceDatasources.length === 0) {
                      return (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          No datasources available
                        </div>
                      )
                    }
                    return traceDatasources.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        {ds.name}
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="conversation-config"
                className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Configuration:
              </label>
              <Select
                value={urlState.conversationConfigId}
                onValueChange={urlState.handleConversationConfigChange}
                disabled={isConfigLoading || hasConfigsPermissionError}
              >
                <SelectTrigger id="conversation-config" className="w-[200px] h-8">
                  <SelectValue
                    placeholder={
                      hasConfigsPermissionError ? "No permission" : "Select configuration"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    if (hasConfigsPermissionError) {
                      return (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          You don&apos;t have permission to view conversation configurations
                        </div>
                      )
                    }
                    if (configurations.length === 0) {
                      return (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          No configurations available
                        </div>
                      )
                    }
                    return configurations.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.name}
                      </SelectItem>
                    ))
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="lookback"
                className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Lookback:
              </label>
              <Select value={urlState.lookback} onValueChange={urlState.handleLookbackChange}>
                <SelectTrigger id="lookback" className="w-[200px] h-8">
                  <SelectValue placeholder="Select lookback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  {lookbackOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <label
                htmlFor="start-date"
                className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Start Date:
              </label>
              <DateTimePicker
                value={urlState.startDate}
                onChange={urlState.handleStartDateChange}
                placeholder="Pick start date and time"
              />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <label
                htmlFor="end-date"
                className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                End Date:
              </label>
              <DateTimePicker
                value={urlState.endDate}
                onChange={urlState.handleEndDateChange}
                placeholder="Pick end date and time"
              />
            </div>

            <Button
              onClick={onSearch}
              disabled={!urlState.isSearchEnabled || isSearchLoading}
              className="h-8 shrink-0"
            >
              {isSearchLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <ConversationsList
          conversations={conversations}
          isLoading={isSearchLoading}
          error={searchError}
          datasourceId={urlState.datasourceId}
          conversationConfigId={urlState.conversationConfigId}
          startDate={urlState.startDate}
          endDate={urlState.endDate}
          lookback={urlState.lookback}
        />
      </div>
    </div>
  )
}
