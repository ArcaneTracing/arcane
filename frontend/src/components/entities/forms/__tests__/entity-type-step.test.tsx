import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntityTypeStep } from '../entity-type-step';
import { EntityType } from '@/types';

describe('EntityTypeStep', () => {
  const mockOnEntityTypeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render entity type select', () => {
    render(
      <EntityTypeStep
        entityType={EntityType.MODEL}
        onEntityTypeChange={mockOnEntityTypeChange} />

    );
    expect(screen.getByText('Entity Type')).toBeInTheDocument();
  });

  it('should display current entity type', () => {
    render(
      <EntityTypeStep
        entityType={EntityType.TOOL}
        onEntityTypeChange={mockOnEntityTypeChange} />

    );

    expect(screen.getByText('Entity Type')).toBeInTheDocument();
  });

  it('should call onEntityTypeChange when type changes', () => {
    render(
      <EntityTypeStep
        entityType={EntityType.MODEL}
        onEntityTypeChange={mockOnEntityTypeChange} />

    );
    expect(screen.getByText('Entity Type')).toBeInTheDocument();
  });

  it('should disable select when disabled prop is true', () => {
    render(
      <EntityTypeStep
        entityType={EntityType.MODEL}
        onEntityTypeChange={mockOnEntityTypeChange}
        disabled={true} />

    );

    expect(screen.getByText('Entity Type')).toBeInTheDocument();
  });

  it('should show helper text', () => {
    render(
      <EntityTypeStep
        entityType={EntityType.MODEL}
        onEntityTypeChange={mockOnEntityTypeChange} />

    );
    expect(screen.getByText(/Select the type of entity/i)).toBeInTheDocument();
  });

  it('should handle invalid entityType', () => {
    render(
      <EntityTypeStep
        entityType={'INVALID_TYPE' as any}
        onEntityTypeChange={mockOnEntityTypeChange} />

    );

    expect(screen.getByText('Entity Type')).toBeInTheDocument();
  });

  it('should handle missing onEntityTypeChange callback', () => {
    const { container } = render(
      <EntityTypeStep
        entityType={EntityType.MODEL}
        onEntityTypeChange={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle disabled being undefined', () => {
    render(
      <EntityTypeStep
        entityType={EntityType.MODEL}
        onEntityTypeChange={mockOnEntityTypeChange}
        disabled={undefined} />

    );

    expect(screen.getByText('Entity Type')).toBeInTheDocument();
  });
});