import { Badge } from '@/components/ui/badge'
import { TruncatedCell } from '@/components/shared/truncated-cell'
import { formatScoreValue } from './evaluation-results-detailed-utils'
import type { ScoreResultValue } from './evaluation-results-detailed-utils'

type ScoreResultCellProps = {
  scoreResult: ScoreResultValue | undefined
  showStatusBadge?: boolean
}

export function ScoreResultCell({ scoreResult, showStatusBadge = true }: Readonly<ScoreResultCellProps>) {
  if (!scoreResult) {
    return <span className="text-muted-foreground text-xs">-</span>
  }

  return (
    <div className="space-y-1">
      <div className="font-medium text-xs">{formatScoreValue(scoreResult.value)}</div>
      {scoreResult.reasoning && (
        <div className="text-xs text-muted-foreground">
          <TruncatedCell value={scoreResult.reasoning} maxLength={50} />
        </div>
      )}
      {showStatusBadge && scoreResult.status !== 'DONE' && (
        <Badge variant="outline" className="text-xs">
          {scoreResult.status}
        </Badge>
      )}
    </div>
  )
}
