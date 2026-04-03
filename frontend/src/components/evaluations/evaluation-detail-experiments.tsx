import { Loader2 } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { ExperimentResponse } from "@/types/experiments"
import { EvaluationResponse } from "@/types/evaluations"
import { EvaluationScope } from "@/types/enums"

interface EvaluationDetailExperimentsProps {
  evaluation: EvaluationResponse
  experiments: ExperimentResponse[]
  projectId: string
  loadingRelated: boolean
}

export function EvaluationDetailExperiments({ evaluation, experiments, projectId, loadingRelated }: Readonly<EvaluationDetailExperimentsProps>) {
  if (evaluation.evaluationScope !== EvaluationScope.EXPERIMENT || evaluation.experiments.length === 0) {
    return null
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Experiments</h3>
      {loadingRelated ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {experiments.length > 0 ? (
            experiments.map((experiment) => (
              <div key={experiment.id} className="p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded">
                <Link
                  to="/projects/$projectId/experiments/$experimentId"
                  params={{ projectId, experimentId: experiment.id }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  {experiment.name}
                </Link>
                {experiment.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {experiment.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            evaluation.experiments.map((experiment) => (
              <div key={experiment.id} className="p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded">
                <p className="text-sm font-medium">Experiment ID: {experiment.id}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Prompt Version: {experiment.promptVersionId} • Dataset: {experiment.datasetId}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

