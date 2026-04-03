"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Key, Copy, AlertTriangle, Check } from 'lucide-react'
import {
  useApiKeyStatus,
  useCreateOrRegenerateApiKey,
  useRevokeApiKey,
} from '@/hooks/api-keys/use-api-keys'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  showSuccessToast,
  showErrorToastFromError,
} from '@/lib/toast'
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

export interface ApiKeysTabProps {
  organisationId: string
  projectId: string
}

export function ApiKeysTab({
  organisationId,
  projectId,
}: Readonly<ApiKeysTabProps>) {
  const { data: status, isLoading } = useApiKeyStatus(organisationId, projectId)
  const { hasPermission } = usePermissions({ organisationId, projectId })
  const canManage = hasPermission(PERMISSIONS.PROJECT.API_KEYS_MANAGE)
  const createMutation = useCreateOrRegenerateApiKey(organisationId, projectId)
  const revokeMutation = useRevokeApiKey(organisationId, projectId)

  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCreateOrRegenerate = async () => {
    try {
      const result = await createMutation.mutateAsync()
      setNewlyCreatedKey(result.apiKey)
      setShowRegenerateConfirm(false)
    } catch (err) {
      showErrorToastFromError(err, 'Failed to create API key')
    }
  }

  const handleRevoke = async () => {
    try {
      await revokeMutation.mutateAsync()
      setShowRevokeConfirm(false)
      showSuccessToast('API key revoked')
    } catch (err) {
      showErrorToastFromError(err, 'Failed to revoke API key')
    }
  }

  const handleCopyKey = async () => {
    if (!newlyCreatedKey) return
    await navigator.clipboard.writeText(newlyCreatedKey)
    setCopied(true)
      showSuccessToast('API key copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDismissNewKey = () => {
    setNewlyCreatedKey(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Project API Key</h2>
        <p className="text-sm text-muted-foreground">
          Use a project API key to access prompts, evaluations, experiments, and other resources
          via the public API without a user session. Authenticate with Basic Auth using username{' '}
          <code className="bg-muted px-1 rounded">api-key</code> and the API key as password.
        </p>
      </div>

      {newlyCreatedKey && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <p className="font-medium">Save your API key now. You won&apos;t be able to see it again.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 text-sm font-mono">
                {newlyCreatedKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDismissNewKey}
              className="border-amber-500/50 hover:bg-amber-500/20"
            >
              I&apos;ve saved my key
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {status?.exists ? 'API key exists' : 'No API key'}
              </p>
              {status?.exists && status?.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Created {new Date(status.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              {status?.exists ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRegenerateConfirm(true)}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Regenerate'
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRevokeConfirm(true)}
                    disabled={revokeMutation.isPending}
                  >
                    {revokeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Revoke'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleCreateOrRegenerate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create API Key'
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {status?.exists && !newlyCreatedKey && (
          <p className="text-sm text-muted-foreground">
            The API key cannot be viewed after creation. Regenerate to create a new key (this will
            invalidate the current one).
          </p>
        )}
      </div>

      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate API key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate the current API key. Any integrations using it will stop working.
              You will receive a new key that you must save immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateOrRegenerate}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRevokeConfirm} onOpenChange={setShowRevokeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently revoke the API key. Any integrations using it will stop working.
              You can create a new key at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
