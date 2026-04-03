"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { evaluationsApi } from "@/api/evaluations"
import type { DetailedResultRow } from "./evaluation-results-detailed-utils"
import type { ScoreResponse } from "@/types/scores"

export interface ManualScoreResultsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: DetailedResultRow | null
  manualScores: ScoreResponse[]
  organisationId: string | null
  projectId: string
  evaluationId: string
  isDatasetEvaluation: boolean
  onSuccess?: () => void
}

function getScaleHint(score: ScoreResponse): string {
  if (score.scale && score.scale.length > 0) {
    return score.scale
      .map((opt) => `${opt.label} (${opt.value})`)
      .join(", ")
  }
  return ""
}

export function ManualScoreResultsModal({
  open,
  onOpenChange,
  row,
  manualScores,
  organisationId,
  projectId,
  evaluationId,
  isDatasetEvaluation,
  onSuccess,
}: Readonly<ManualScoreResultsModalProps>) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && row) {
      const initial: Record<string, string> = {}
      for (const score of manualScores) {
        const sr = row.scoreResults.get(score.id)
        const val = sr?.value
        initial[score.id] =
          val !== null && val !== undefined ? String(val) : ""
      }
      setValues(initial)
      setError(null)
    }
  }, [open, row, manualScores])

  const handleValueChange = (scoreId: string, raw: string) => {
    setValues((prev) => ({ ...prev, [scoreId]: raw }))
  }

  const parseValuesToSave = (): { toSave: Record<string, number>; error: string | null } => {
    const toSave: Record<string, number> = {}
    for (const score of manualScores) {
      const raw = values[score.id]?.trim()
      if (raw === "") continue
      const num = Number.parseFloat(raw)
      if (Number.isNaN(num)) return { toSave: {}, error: `Invalid number for ${score.name}` }
      toSave[score.id] = num
    }
    if (Object.keys(toSave).length === 0) return { toSave: {}, error: "Enter at least one value" }
    return { toSave, error: null }
  }

  const handleSave = async () => {
    if (!row || !organisationId) return
    if (!isDatasetEvaluation && !row.experimentResultId) {
      setError("Missing experiment result for this row")
      return
    }

    const { toSave, error: parseError } = parseValuesToSave()
    if (parseError) {
      setError(parseError)
      return
    }

    setError(null)
    setSaving(true)
    try {
      for (const score of manualScores) {
        const value = toSave[score.id]
        if (value === undefined) continue

        const resultPayload = isDatasetEvaluation
          ? { datasetRowId: row.id, value }
          : { experimentResultId: row.experimentResultId!, value }

        await evaluationsApi.importScoreResults(
          organisationId,
          projectId,
          evaluationId,
          score.id,
          { results: [resultPayload] }
        )
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (!row) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter manual score results</DialogTitle>
          <DialogDescription>
            Enter numeric values for each manual score. Fields accept numbers only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {manualScores.map((score) => {
            const hint = getScaleHint(score)
            return (
              <div key={score.id} className="space-y-2">
                <Label htmlFor={`manual-${score.id}`} className="text-sm font-medium">
                  {score.name}
                  {score.description && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      – {score.description}
                    </span>
                  )}
                </Label>
                {hint && (
                  <p className="text-xs text-muted-foreground">
                    Scale: {hint}
                  </p>
                )}
                <Input
                  id={`manual-${score.id}`}
                  type="number"
                  step="any"
                  value={values[score.id] ?? ""}
                  onChange={(e) => handleValueChange(score.id, e.target.value)}
                  placeholder="Enter value"
                  className="w-full"
                />
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
