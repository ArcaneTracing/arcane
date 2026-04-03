import {
  getScoreName,
  formatScoreValue,
  getDetailedDescription,
  filterDetailedRows,
  buildExperimentCombinedRows,
  buildDatasetCombinedRows,
} from '../evaluation-results-detailed-utils'

describe('getScoreName', () => {
  const scores = [{ id: 's1', name: 'Score One' }]
  const evaluation = { scores: [{ id: 's2', name: 'Eval Score Two' }] } as any

  it('returns name from scores when found', () => {
    expect(getScoreName('s1', scores, evaluation)).toBe('Score One')
  })

  it('returns name from evaluation.scores when not in scores', () => {
    expect(getScoreName('s2', scores, evaluation)).toBe('Eval Score Two')
  })

  it('returns truncated scoreId when not found anywhere', () => {
    expect(getScoreName('unknown-id-123', scores, evaluation)).toBe('unknown-')
  })
})

describe('getDetailedDescription', () => {
  it('returns dataset row description when isDatasetEvaluation', () => {
    expect(getDetailedDescription(true, false)).toBe(
      'View individual score results for each dataset row'
    )
  })

  it('returns dataset row description when hasSingleExperiment', () => {
    expect(getDetailedDescription(false, true)).toBe(
      'View individual score results for each dataset row'
    )
  })

  it('returns experiment selector description for multi-experiment', () => {
    expect(getDetailedDescription(false, false)).toBe(
      'View individual score results for each experiment. Select an experiment to view its results.'
    )
  })
})

describe('formatScoreValue', () => {
  it('returns N/A for null', () => {
    expect(formatScoreValue(null)).toBe('N/A')
  })

  it('formats number with 3 decimal places', () => {
    expect(formatScoreValue(1.23456)).toBe('1.235')
  })

  it('converts string to string', () => {
    expect(formatScoreValue('hello')).toBe('hello')
  })
})

describe('buildExperimentCombinedRows', () => {
  const datasetRows = [
    { id: 'r1', values: ['a'] },
    { id: 'r2', values: ['b'] },
    { id: 'r3', values: ['c'] },
  ] as any
  const experimentResults = [
    { datasetRowId: 'r1', result: 'result1' },
    { datasetRowId: 'r2', result: undefined },
  ]
  const scoreResultsByRowId = new Map([
    ['r2', new Map([['score1', { value: 1, status: 'DONE' }]])],
    ['r3', new Map([['score1', { value: 2, status: 'DONE' }]])],
  ])

  it('combines rows with experiment results and score results', () => {
    const result = buildExperimentCombinedRows(datasetRows, experimentResults, scoreResultsByRowId)
    expect(result).toHaveLength(3)
    expect(result[0].experimentResult).toBe('result1')
    expect(result[0].scoreResults.size).toBe(0)
    expect(result[1].experimentResult).toBeUndefined()
    expect(result[1].scoreResults.get('score1')?.value).toBe(1)
    expect(result[2].experimentResult).toBeUndefined()
    expect(result[2].scoreResults.get('score1')?.value).toBe(2)
  })

  it('filters out rows with no experiment result and no score results', () => {
    const emptyScores = new Map<string, Map<string, any>>()
    const result = buildExperimentCombinedRows(
      [{ id: 'r1', values: ['a'] }] as any,
      [],
      emptyScores
    )
    expect(result).toHaveLength(0)
  })
})

describe('buildDatasetCombinedRows', () => {
  const datasetRows = [
    { id: 'r1', values: ['a'] },
    { id: 'r2', values: ['b'] },
  ] as any
  const datasetResultsByRowId = new Map([
    [
      'r1',
      {
        id: 'dr1',
        datasetRowId: 'r1',
        scoreResults: [
          { scoreId: 's1', value: 10, status: 'DONE' },
          { scoreId: 's2', value: 'ok', reasoning: 'r1', status: 'DONE' },
        ],
      } as any,
    ],
  ])

  it('combines rows with score results from dataset results', () => {
    const result = buildDatasetCombinedRows(datasetRows, datasetResultsByRowId)
    expect(result).toHaveLength(1)
    expect(result[0].scoreResults.get('s1')?.value).toBe(10)
    expect(result[0].scoreResults.get('s2')?.value).toBe('ok')
    expect(result[0].scoreResults.get('s2')?.reasoning).toBe('r1')
  })

  it('filters out rows with no score results', () => {
    const result = buildDatasetCombinedRows(
      [{ id: 'r2', values: ['b'] }] as any,
      datasetResultsByRowId
    )
    expect(result).toHaveLength(0)
  })
})

describe('filterDetailedRows', () => {
  const rows = [
    { id: 'r1', values: ['hello', 'world'], experimentResult: undefined, scoreResults: new Map() },
    { id: 'r2', values: ['foo'], experimentResult: 'bar result', scoreResults: new Map() },
  ] as any

  it('returns all rows when searchQuery is empty', () => {
    expect(filterDetailedRows(rows, '', true)).toHaveLength(2)
  })

  it('filters by dataset values', () => {
    const result = filterDetailedRows(rows, 'hello', true)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('r1')
  })

  it('filters by experiment result when hasSingleExperiment is false', () => {
    const result = filterDetailedRows(rows, 'bar', false)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('r2')
  })

  it('does not filter by experiment result when hasSingleExperiment is true', () => {
    const result = filterDetailedRows(rows, 'bar', true)
    expect(result).toHaveLength(0)
  })

  it('returns empty when no match', () => {
    expect(filterDetailedRows(rows, 'nonexistent', false)).toHaveLength(0)
  })
})
