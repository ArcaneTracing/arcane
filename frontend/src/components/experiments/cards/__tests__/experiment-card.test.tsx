import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExperimentCard } from '../experiment-card';
import { ExperimentResponse } from '@/types/experiments';

describe('ExperimentCard', () => {
  const mockExperiment: ExperimentResponse = {
    id: '1',
    name: 'Test Experiment',
    description: 'Test Description',
    promptVersionId: 'prompt-123',
    datasetId: 'dataset-456',
    projectId: 'project-1',
    promptInputMappings: {},
    results: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockOnView = jest.fn();
  const mockOnRerun = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render experiment information', () => {
    render(
      <ExperimentCard
        experiment={mockExperiment}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test Experiment')).toBeInTheDocument();
  });

  it('should call onView when details button is clicked', () => {
    render(
      <ExperimentCard
        experiment={mockExperiment}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete} />

    );
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);
    expect(mockOnView).toHaveBeenCalledWith('1');
  });

  it('should call onRerun when rerun button is clicked', () => {
    render(
      <ExperimentCard
        experiment={mockExperiment}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete} />

    );
    const rerunButton = screen.getByRole('button', { name: /re-run/i });
    fireEvent.click(rerunButton);
    expect(mockOnRerun).toHaveBeenCalledWith(mockExperiment);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <ExperimentCard
        experiment={mockExperiment}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete} />

    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockExperiment);
  });

  it('shows Experiment when name is empty', () => {
    render(
      <ExperimentCard
        experiment={{ ...mockExperiment, name: '' }}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Experiment')).toBeInTheDocument();
  });

  it('should display results count when available', () => {
    const experimentWithResults = {
      ...mockExperiment,
      description: undefined,
      results: [{ id: '1' }, { id: '2' }] as any
    };
    render(
      <ExperimentCard
        experiment={experimentWithResults}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText(/Results: 2/i)).toBeInTheDocument();
  });
});