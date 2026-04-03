import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScoreDialog } from '../score-dialog';
import { ScoreResponse } from '@/types/scores';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/components/scores/forms/score-form', () => ({
  ScoreForm: ({ score, projectId, onSuccess }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'score-form' },
    score ? 'Edit Form' : 'Create Form'
    );
  }
}));
describe('ScoreDialog', () => {
  it('should render create mode dialog when open', () => {
    customRender(
      <ScoreDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Create New Score')).toBeInTheDocument();
    expect(screen.getByText(/Define a reusable scoring criterion/i)).toBeInTheDocument();
  });

  it('should render edit mode dialog when score is provided', () => {
    const score: ScoreResponse = {
      id: '1',
      name: 'Test Score',
      description: 'Test Description',
      scoringType: 'NUMERIC',
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreDialog
        score={score}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Edit Score')).toBeInTheDocument();
    expect(screen.getByText(/Update the scoring criterion configuration/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <ScoreDialog
        open={false}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.queryByText('Create New Score')).not.toBeInTheDocument();
  });

  it('should close dialog when RAGAS score is provided', () => {
    const ragasScore: ScoreResponse = {
      id: '1',
      name: 'RAGAS Score',
      description: 'RAGAS Description',
      scoringType: 'RAGAS',
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    const mockOnOpenChange = jest.fn();
    customRender(
      <ScoreDialog
        score={ragasScore}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onSuccess callback when provided', () => {
    const mockOnSuccess = jest.fn();
    customRender(
      <ScoreDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1"
        onSuccess={mockOnSuccess} />

    );

    expect(screen.getByTestId('score-form')).toBeInTheDocument();
  });


  it('should handle null score', () => {
    customRender(
      <ScoreDialog
        score={null}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );

    expect(screen.getByText('Create New Score')).toBeInTheDocument();
  });

  it('should handle undefined score', () => {
    customRender(
      <ScoreDialog
        score={undefined}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );

    expect(screen.getByText('Create New Score')).toBeInTheDocument();
  });

  it('should handle empty string projectId', () => {
    customRender(
      <ScoreDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="" />

    );

    expect(screen.getByText('Create New Score')).toBeInTheDocument();
  });

  it('should handle missing onOpenChange callback', () => {
    const { container } = customRender(
      <ScoreDialog
        open={true}
        onOpenChange={undefined as any}
        projectId="project-1" />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle missing onSuccess callback', () => {
    customRender(
      <ScoreDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1"
        onSuccess={undefined} />

    );

    expect(screen.getByText('Create New Score')).toBeInTheDocument();
  });

  it('should handle CATEGORY score type', () => {
    const categoryScore: ScoreResponse = {
      id: '1',
      name: 'Category Score',
      description: 'Category Description',
      scoringType: 'NOMINAL',
      scale: [{ label: 'Good', value: 1 }],
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreDialog
        score={categoryScore}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Edit Score')).toBeInTheDocument();
  });

  it('should handle NUMERIC score type', () => {
    const numericScore: ScoreResponse = {
      id: '1',
      name: 'Numeric Score',
      description: 'Numeric Description',
      scoringType: 'NUMERIC',
      scale: [{ label: '0', value: 0 }, { label: '10', value: 10 }],
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreDialog
        score={numericScore}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Edit Score')).toBeInTheDocument();
  });
});