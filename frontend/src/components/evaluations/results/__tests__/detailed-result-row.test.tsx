import { render, screen } from '@/__tests__/test-utils'
import { DetailedResultRowComponent } from '../detailed-result-row'
import type { DetailedResultRow } from '../evaluation-results-detailed-utils'

const createRow = (overrides?: Partial<DetailedResultRow>): DetailedResultRow => ({
  id: 'row-1',
  values: ['val1', 'val2'],
  scoreResults: new Map([
    ['score-1', { value: 0.95, status: 'DONE', reasoning: undefined }],
  ]),
  experimentResult: undefined,
  ...overrides,
})

describe('DetailedResultRowComponent', () => {
  it('renders row values from headers', () => {
    const row = createRow()
    render(
      <table>
        <tbody>
          <DetailedResultRowComponent
            row={row}
            headers={['Col1', 'Col2']}
            displayScoreIds={['score-1']}
            showExperimentColumn={false}
          />
        </tbody>
      </table>
    )
    expect(screen.getByText('val1')).toBeInTheDocument()
    expect(screen.getByText('val2')).toBeInTheDocument()
  })

  it('renders score result cell', () => {
    const row = createRow()
    render(
      <table>
        <tbody>
          <DetailedResultRowComponent
            row={row}
            headers={['Col1', 'Col2']}
            displayScoreIds={['score-1']}
            showExperimentColumn={false}
          />
        </tbody>
      </table>
    )
    expect(screen.getByText('0.950')).toBeInTheDocument()
  })

  it('renders experiment column when showExperimentColumn is true', () => {
    const row = createRow({ experimentResult: 'Exp A' })
    render(
      <table>
        <tbody>
          <DetailedResultRowComponent
            row={row}
            headers={['Col1', 'Col2']}
            displayScoreIds={['score-1']}
            showExperimentColumn={true}
          />
        </tbody>
      </table>
    )
    expect(screen.getByText('Exp A')).toBeInTheDocument()
  })
})
