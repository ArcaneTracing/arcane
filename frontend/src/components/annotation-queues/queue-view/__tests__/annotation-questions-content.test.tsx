import { render, screen } from '@/__tests__/test-utils'
import { AnnotationQuestionsContent } from '../annotation-questions-content'

jest.mock('@/components/annotation-queues/question-preview/question-preview', () => ({
  QuestionPreview: ({ question, value }: { question: { id: string; title: string }; value: unknown }) => (
    <div data-testid="question-preview">
      {question.title}: {String(value ?? '')}
    </div>
  ),
}))

describe('AnnotationQuestionsContent', () => {
  it('shows loading state when isTemplateLoading', () => {
    render(
      <AnnotationQuestionsContent
        isTemplateLoading={true}
        questions={[]}
        answers={{}}
        readOnly={false}
        onAnswerChange={jest.fn()}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows message when no questions', () => {
    render(
      <AnnotationQuestionsContent
        isTemplateLoading={false}
        questions={[]}
        answers={{}}
        readOnly={false}
        onAnswerChange={jest.fn()}
      />
    )
    expect(screen.getByText(/No questions found in template/)).toBeInTheDocument()
  })

  it('renders questions when provided', () => {
    render(
      <AnnotationQuestionsContent
        isTemplateLoading={false}
        questions={[{ id: 'q1', title: 'Question 1', type: 'TEXT' }] as never}
        answers={{}}
        readOnly={false}
        onAnswerChange={jest.fn()}
      />
    )
    expect(screen.getByTestId('question-preview')).toBeInTheDocument()
    expect(screen.getByText(/Question 1:/)).toBeInTheDocument()
  })
})
