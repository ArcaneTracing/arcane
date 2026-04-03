"use client"

import { EvaluationResponse } from "@/types/evaluations"

interface EvaluationDetailMetadataProps {
  evaluation: EvaluationResponse
}

export function EvaluationDetailMetadata({ evaluation }: Readonly<EvaluationDetailMetadataProps>) {
  if (!evaluation.metadata) {
    return null
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Metadata</h3>
      <pre className="text-xs bg-gray-50 dark:bg-[#1A1A1A] p-3 rounded overflow-auto">
        {JSON.stringify(evaluation.metadata, null, 2)}
      </pre>
    </div>
  )
}

