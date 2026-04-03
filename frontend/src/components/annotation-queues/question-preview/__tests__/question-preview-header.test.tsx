import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuestionPreviewHeader } from '../question-preview-header';

describe('QuestionPreviewHeader', () => {
  it('should render question text', () => {
    render(<QuestionPreviewHeader question="Test Question" />);

    expect(screen.getByText('Test Question')).toBeInTheDocument();
  });

  it('should display required asterisk when required is true', () => {
    render(<QuestionPreviewHeader question="Test Question" required={true} />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not display required asterisk when required is false', () => {
    render(<QuestionPreviewHeader question="Test Question" required={false} />);

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should not display required asterisk when required is undefined', () => {
    render(<QuestionPreviewHeader question="Test Question" />);

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should display helper text when provided', () => {
    render(
      <QuestionPreviewHeader
        question="Test Question"
        helperText="This is helper text" />

    );

    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should not display helper text when not provided', () => {
    render(<QuestionPreviewHeader question="Test Question" />);

    expect(screen.queryByText(/helper/i)).not.toBeInTheDocument();
  });

  it('should display both question and helper text', () => {
    render(
      <QuestionPreviewHeader
        question="Test Question"
        helperText="Helper text"
        required={true} />

    );

    expect(screen.getByText('Test Question')).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });


  it('should handle empty question text', () => {
    const { container } = render(<QuestionPreviewHeader question="" />);


    expect(container.textContent).toBe('');
  });

  it('should handle very long question text', () => {
    const longQuestion = 'a'.repeat(1000);
    render(<QuestionPreviewHeader question={longQuestion} />);

    expect(screen.getByText(longQuestion)).toBeInTheDocument();
  });

  it('should handle very long helper text', () => {
    const longHelperText = 'a'.repeat(1000);
    render(
      <QuestionPreviewHeader
        question="Test Question"
        helperText={longHelperText} />

    );

    expect(screen.getByText(longHelperText)).toBeInTheDocument();
  });

  it('should handle special characters in question', () => {
    const specialQuestion = 'Question!@#$%^&*()_+-=[]{}|;:,.<>?';
    render(<QuestionPreviewHeader question={specialQuestion} />);

    expect(screen.getByText(specialQuestion)).toBeInTheDocument();
  });

  it('should handle special characters in helper text', () => {
    const specialHelperText = 'Helper!@#$%^&*()_+-=[]{}|;:,.<>?';
    render(
      <QuestionPreviewHeader
        question="Test Question"
        helperText={specialHelperText} />

    );

    expect(screen.getByText(specialHelperText)).toBeInTheDocument();
  });
});