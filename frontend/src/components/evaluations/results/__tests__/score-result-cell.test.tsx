import { render, screen } from '@/__tests__/test-utils'
import { ScoreResultCell } from '../score-result-cell'

describe('ScoreResultCell', () => {
  it('renders dash when scoreResult is undefined', () => {
    render(<ScoreResultCell scoreResult={undefined} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('renders formatted value when scoreResult provided', () => {
    render(
      <ScoreResultCell
        scoreResult={{ value: 0.95, status: 'DONE', reasoning: undefined }}
      />
    )
    expect(screen.getByText('0.950')).toBeInTheDocument()
  })

  it('renders reasoning when provided', () => {
    render(
      <ScoreResultCell
        scoreResult={{ value: 0.8, status: 'DONE', reasoning: 'Short reason' }}
      />
    )
    expect(screen.getByText('Short reason')).toBeInTheDocument()
  })

  it('renders status badge when status is not DONE', () => {
    render(
      <ScoreResultCell
        scoreResult={{ value: 0.5, status: 'PENDING', reasoning: undefined }}
      />
    )
    expect(screen.getByText('PENDING')).toBeInTheDocument()
  })

  it('does not render status badge when showStatusBadge is false', () => {
    render(
      <ScoreResultCell
        scoreResult={{ value: 0.5, status: 'PENDING', reasoning: undefined }}
        showStatusBadge={false}
      />
    )
    expect(screen.getByText('0.500')).toBeInTheDocument()
    expect(screen.queryByText('PENDING')).not.toBeInTheDocument()
  })
})
