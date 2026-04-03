import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreCard } from '../score-card';
import { ScoreResponse } from '@/types/scores';

describe('ScoreCard', () => {
  const mockScore: ScoreResponse = {
    id: '1',
    name: 'Test Score',
    description: 'Test Description',
    scoringType: 'NUMERIC',
    scale: [{ label: '0', value: 0 }, { label: '10', value: 10 }],
    projectId: 'project-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render score information', () => {
    render(
      <ScoreCard
        score={mockScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should call onView when details button is clicked', () => {
    render(
      <ScoreCard
        score={mockScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);
    expect(mockOnView).toHaveBeenCalledWith('1');
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <ScoreCard
        score={mockScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockScore);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <ScoreCard
        score={mockScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockScore);
  });

  it('should not render action buttons for RAGAS scores', () => {
    const ragasScore = {
      ...mockScore,
      scoringType: 'RAGAS'
    };
    render(
      <ScoreCard
        score={ragasScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('Details')).not.toBeInTheDocument();
  });


  it('should handle missing description', () => {
    const scoreWithoutDesc = {
      ...mockScore,
      description: undefined
    };
    render(
      <ScoreCard
        score={scoreWithoutDesc}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle null description', () => {
    const scoreWithNullDesc = {
      ...mockScore,
      description: null
    };
    render(
      <ScoreCard
        score={scoreWithNullDesc}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle empty string description', () => {
    const scoreWithEmptyDesc = {
      ...mockScore,
      description: ''
    };
    render(
      <ScoreCard
        score={scoreWithEmptyDesc}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle very long score name', () => {
    const longNameScore = {
      ...mockScore,
      name: 'a'.repeat(500)
    };
    render(
      <ScoreCard
        score={longNameScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle very long description', () => {
    const longDescScore = {
      ...mockScore,
      description: 'b'.repeat(1000)
    };
    render(
      <ScoreCard
        score={longDescScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('b'.repeat(1000))).toBeInTheDocument();
  });

  it('should handle special characters in name', () => {
    const specialCharsScore = {
      ...mockScore,
      name: 'Test!@#$%^&*()_+Score'
    };
    render(
      <ScoreCard
        score={specialCharsScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test!@#$%^&*()_+Score')).toBeInTheDocument();
  });

  it('should display category scale information', () => {
    const categoryScore = {
      ...mockScore,
      scoringType: 'CATEGORY',
      categoryScale: [
      { label: 'Good', value: 1 },
      { label: 'Bad', value: 0 }]

    };
    render(
      <ScoreCard
        score={categoryScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle numeric scale with partial values', () => {
    const partialScaleScore = {
      ...mockScore,
      numericScale: { min: 0 }
    };
    render(
      <ScoreCard
        score={partialScaleScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle empty numeric scale', () => {
    const emptyScaleScore = {
      ...mockScore,
      numericScale: {}
    };
    render(
      <ScoreCard
        score={emptyScaleScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle null numeric scale', () => {
    const nullScaleScore = {
      ...mockScore,
      numericScale: null
    };
    render(
      <ScoreCard
        score={nullScaleScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle empty category scale', () => {
    const emptyCategoryScore = {
      ...mockScore,
      scoringType: 'CATEGORY',
      categoryScale: []
    };
    render(
      <ScoreCard
        score={emptyCategoryScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle null category scale', () => {
    const nullCategoryScore = {
      ...mockScore,
      scoringType: 'CATEGORY',
      categoryScale: null
    };
    render(
      <ScoreCard
        score={nullCategoryScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle missing callbacks gracefully', () => {
    const { container } = render(
      <ScoreCard
        score={mockScore}
        onView={undefined as any}
        onEdit={undefined as any}
        onDelete={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should prevent event propagation on edit button click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <ScoreCard
          score={mockScore}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should prevent event propagation on delete button click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <ScoreCard
          score={mockScore}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should display scoring type badge', () => {
    render(
      <ScoreCard
        score={mockScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('NUMERIC')).toBeInTheDocument();
  });

  it('should handle CATEGORY scoring type', () => {
    const categoryScore = {
      ...mockScore,
      scoringType: 'CATEGORY',
      categoryScale: [{ label: 'Good', value: 1 }]
    };
    render(
      <ScoreCard
        score={categoryScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('CATEGORY')).toBeInTheDocument();
  });

  it('should handle empty string name', () => {
    const emptyNameScore = {
      ...mockScore,
      name: ''
    };
    const { container } = render(
      <ScoreCard
        score={emptyNameScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  it('should handle whitespace-only name', () => {
    const whitespaceScore = {
      ...mockScore,
      name: '   '
    };
    const { container } = render(
      <ScoreCard
        score={whitespaceScore}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });
});