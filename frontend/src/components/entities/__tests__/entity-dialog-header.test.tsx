import React from 'react';
import { render, screen } from '@testing-library/react';
import { EntityDialogHeader } from '../entity-dialog-header';
import { DialogHeader } from '@/components/ui/dialog';
import { entityTooltips } from '@/constants/entity-tooltips';

describe('EntityDialogHeader', () => {
  it('should render create mode header', () => {
    render(
      <DialogHeader>
        <EntityDialogHeader isEditMode={false} />
      </DialogHeader>
    );
    expect(screen.getByText('Create New Entity')).toBeInTheDocument();
    expect(screen.getByText(entityTooltips.dialog.header)).toBeInTheDocument();
  });

  it('should render edit mode header', () => {
    render(
      <DialogHeader>
        <EntityDialogHeader isEditMode={true} />
      </DialogHeader>
    );
    expect(screen.getByText('Edit Entity')).toBeInTheDocument();
    expect(screen.getByText(entityTooltips.dialog.header)).toBeInTheDocument();
  });

  it('should handle isEditMode being null', () => {
    render(
      <DialogHeader>
        <EntityDialogHeader isEditMode={null as any} />
      </DialogHeader>
    );

    expect(screen.getByText('Create New Entity')).toBeInTheDocument();
  });

  it('should handle isEditMode being undefined', () => {
    render(
      <DialogHeader>
        <EntityDialogHeader isEditMode={undefined as any} />
      </DialogHeader>
    );

    expect(screen.getByText('Create New Entity')).toBeInTheDocument();
  });
});