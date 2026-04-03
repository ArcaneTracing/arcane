import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExperimentDialog } from '../experiment-dialog';
import { ExperimentResponse } from '@/types/experiments';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('../../forms/experiment-form', () => ({
  ExperimentForm: ({ experiment, projectId, onSuccess }: any) =>
  <div data-testid="experiment-form">
      <div>Project ID: {projectId}</div>
      {experiment && <div>Experiment ID: {experiment.id}</div>}
      <button onClick={onSuccess}>Submit</button>
    </div>

}));

describe('ExperimentDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when open', () => {
    customRender(
      <ExperimentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('Create New Experiment')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    customRender(
      <ExperimentDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.queryByText('Create New Experiment')).not.toBeInTheDocument();
  });

  it('should display view title when experiment provided', () => {
    const experiment: ExperimentResponse = {
      id: 'experiment-1',
      projectId: 'project-1',
      name: 'Test Experiment',
      description: 'Test Description',
      promptVersionId: 'prompt-1',
      datasetId: 'dataset-1',
      promptInputMappings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customRender(
      <ExperimentDialog
        experiment={experiment}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('View experiment')).toBeInTheDocument();
  });

  it('should display create mode description', () => {
    customRender(
      <ExperimentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText(/Run a prompt version against a dataset/i)).toBeInTheDocument();
  });

  it('should display view mode description when experiment provided', () => {
    const experiment: ExperimentResponse = {
      id: 'experiment-1',
      projectId: 'project-1',
      name: 'Test Experiment',
      description: 'Test Description',
      promptVersionId: 'prompt-1',
      datasetId: 'dataset-1',
      promptInputMappings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customRender(
      <ExperimentDialog
        experiment={experiment}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText(/Experiment configuration cannot be updated/i)).toBeInTheDocument();
  });

  it('should render ExperimentForm', () => {
    customRender(
      <ExperimentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByTestId('experiment-form')).toBeInTheDocument();
  });

  it('should pass projectId to ExperimentForm', () => {
    customRender(
      <ExperimentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('Project ID: project-1')).toBeInTheDocument();
  });

  it('should pass experiment to ExperimentForm when provided', () => {
    const experiment: ExperimentResponse = {
      id: 'experiment-1',
      projectId: 'project-1',
      name: 'Test Experiment',
      description: 'Test Description',
      promptVersionId: 'prompt-1',
      datasetId: 'dataset-1',
      promptInputMappings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customRender(
      <ExperimentDialog
        experiment={experiment}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('Experiment ID: experiment-1')).toBeInTheDocument();
  });

  it('should call onOpenChange and onSuccess when form succeeds', () => {
    customRender(
      <ExperimentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1"
        onSuccess={mockOnSuccess} />

    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange when form succeeds even without onSuccess', () => {
    customRender(
      <ExperimentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });


  it('should handle null experiment', () => {
    customRender(
      <ExperimentDialog
        experiment={null}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('Create New Experiment')).toBeInTheDocument();
  });

  it('should handle undefined experiment', () => {
    customRender(
      <ExperimentDialog
        experiment={undefined}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('Create New Experiment')).toBeInTheDocument();
  });

  it('should handle empty projectId', () => {
    customRender(
      <ExperimentDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="" />

    );

    expect(screen.getByText('Create New Experiment')).toBeInTheDocument();
  });

  it('should handle experiment with null description', () => {
    const experiment: ExperimentResponse = {
      id: 'experiment-1',
      projectId: 'project-1',
      name: 'Test Experiment',
      description: null,
      promptVersionId: 'prompt-1',
      datasetId: 'dataset-1',
      promptInputMappings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customRender(
      <ExperimentDialog
        experiment={experiment}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('View experiment')).toBeInTheDocument();
  });
});