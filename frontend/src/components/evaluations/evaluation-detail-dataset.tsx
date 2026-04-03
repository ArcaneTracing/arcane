import { Loader2 } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { DatasetListItemResponse } from "@/types/datasets"
import { EvaluationResponse } from "@/types/evaluations"
import { EvaluationScope } from "@/types/enums"
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation"

interface EvaluationDetailDatasetProps {
  evaluation: EvaluationResponse
  dataset: DatasetListItemResponse | null | undefined
  projectId: string
  loadingRelated: boolean
}

export function EvaluationDetailDataset({ evaluation, dataset, projectId, loadingRelated }: Readonly<EvaluationDetailDatasetProps>) {
  const organisationId = useOrganisationIdOrNull()
  
  if (evaluation.evaluationScope !== EvaluationScope.DATASET || !evaluation.datasetId) {
    return null
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Dataset</h3>
      {(() => {
        if (loadingRelated) {
          return (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
            </div>
          )
        }
        if (dataset) {
          return (
        <Link
          to="/organisations/$organisationId/projects/$projectId/datasets/$datasetId"
          params={{ organisationId: organisationId as string, projectId, datasetId: dataset.id }}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
        >
          {dataset.name}
        </Link>
          )
        }
        return (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {evaluation.datasetId}
        </p>
        )
      })()}
    </div>
  )
}

