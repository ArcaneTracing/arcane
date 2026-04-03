import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatasourceCard } from '../datasource-card';
import { DatasourceResponse, DatasourceSource, DatasourceType } from '@/types';
jest.mock('@/components/datasources/badges/datasource-source-badge', () => ({
  DatasourceSourceBadge: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'datasource-badge' }, 'Badge');
  }
}));

describe('DatasourceCard', () => {
  const mockDatasource: DatasourceResponse = {
    id: '1',
    name: 'Test Datasource',
    description: 'Test Description',
    type: DatasourceType.TRACES,
    source: DatasourceSource.TEMPO,
    url: 'https://example.com'
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render datasource information', () => {
    render(
      <DatasourceCard
        datasource={mockDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test Datasource')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <DatasourceCard
        datasource={mockDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockDatasource);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <DatasourceCard
        datasource={mockDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockDatasource);
  });

  it('should display datasource URL', () => {
    render(
      <DatasourceCard
        datasource={mockDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });


  it('should not render description when description is missing', () => {
    const datasourceWithoutDescription = {
      ...mockDatasource,
      description: undefined
    };

    render(
      <DatasourceCard
        datasource={datasourceWithoutDescription}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should not render description when description is empty string', () => {
    const datasourceWithEmptyDescription = {
      ...mockDatasource,
      description: ''
    };

    render(
      <DatasourceCard
        datasource={datasourceWithEmptyDescription}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should handle very long datasource name', () => {
    const longNameDatasource = {
      ...mockDatasource,
      name: 'a'.repeat(500)
    };

    render(
      <DatasourceCard
        datasource={longNameDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle very long description', () => {
    const longDescDatasource = {
      ...mockDatasource,
      description: 'b'.repeat(1000)
    };

    render(
      <DatasourceCard
        datasource={longDescDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('b'.repeat(1000))).toBeInTheDocument();
  });

  it('should handle very long URL', () => {
    const longUrlDatasource = {
      ...mockDatasource,
      url: 'https://example.com/' + 'a'.repeat(500)
    };

    render(
      <DatasourceCard
        datasource={longUrlDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('https://example.com/' + 'a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle special characters in name', () => {
    const specialCharsDatasource = {
      ...mockDatasource,
      name: 'Test!@#$%^&*()_+Datasource'
    };

    render(
      <DatasourceCard
        datasource={specialCharsDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test!@#$%^&*()_+Datasource')).toBeInTheDocument();
  });

  it('should handle empty string URL', () => {
    const emptyUrlDatasource = {
      ...mockDatasource,
      url: ''
    };

    render(
      <DatasourceCard
        datasource={emptyUrlDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Datasource')).toBeInTheDocument();
  });

  it('should handle missing callbacks gracefully', () => {
    const { container } = render(
      <DatasourceCard
        datasource={mockDatasource}
        onEdit={undefined as any}
        onDelete={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should prevent event propagation on edit button click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <DatasourceCard
          datasource={mockDatasource}
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
        <DatasourceCard
          datasource={mockDatasource}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should render different source types', () => {
    const jaegerDatasource = {
      ...mockDatasource,
      source: DatasourceSource.JAEGER
    };

    render(
      <DatasourceCard
        datasource={jaegerDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test Datasource')).toBeInTheDocument();
    expect(screen.getByTestId('datasource-badge')).toBeInTheDocument();
  });

  it('should render type badge', () => {
    render(
      <DatasourceCard
        datasource={mockDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText(DatasourceType.TRACES)).toBeInTheDocument();
  });

  it('should render ClickHouse source and format connection string', () => {
    const clickhouseDatasource = {
      ...mockDatasource,
      source: DatasourceSource.CLICKHOUSE,
      url: 'fallback-url',
      config: {
        clickhouse: {
          host: 'localhost',
          port: 8123,
          database: 'traces',
          tableName: 'spans',
          protocol: 'https' as const
        }
      }
    };
    render(
      <DatasourceCard
        datasource={clickhouseDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('https://localhost:8123/traces/spans')).toBeInTheDocument();
  });

  it('should format ClickHouse connection with default protocol and port when missing', () => {
    const clickhouseMinimal = {
      ...mockDatasource,
      source: DatasourceSource.CLICKHOUSE,
      config: {
        clickhouse: {
          host: 'db.local',
          database: 'traces',
          tableName: 'spans'
        }
      }
    };
    render(
      <DatasourceCard
        datasource={clickhouseMinimal}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText(/http:\/\/db\.local:8123\/traces\/spans/)).toBeInTheDocument();
  });

  it('should format ClickHouse connection with username', () => {
    const clickhouseWithAuth = {
      ...mockDatasource,
      source: DatasourceSource.CLICKHOUSE,
      config: {
        clickhouse: {
          host: 'db.example.com',
          port: 9000,
          database: 'otel',
          tableName: 'traces',
          username: 'admin'
        }
      }
    };
    render(
      <DatasourceCard
        datasource={clickhouseWithAuth}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText(/admin@/)).toBeInTheDocument();
  });

  it('should render CUSTOM_API source', () => {
    const customApiDatasource = {
      ...mockDatasource,
      source: DatasourceSource.CUSTOM_API
    };
    render(
      <DatasourceCard
        datasource={customApiDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test Datasource')).toBeInTheDocument();
    expect(screen.getByTestId('datasource-badge')).toBeInTheDocument();
  });

  it('should use Database icon when source has no icon', () => {
    const unknownSourceDatasource = {
      ...mockDatasource,
      source: 'unknown' as DatasourceSource
    };
    const { container } = render(
      <DatasourceCard
        datasource={unknownSourceDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should handle empty string name', () => {
    const emptyNameDatasource = {
      ...mockDatasource,
      name: ''
    };

    const { container } = render(
      <DatasourceCard
        datasource={emptyNameDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  it('should handle whitespace-only name', () => {
    const whitespaceDatasource = {
      ...mockDatasource,
      name: '   '
    };

    const { container } = render(
      <DatasourceCard
        datasource={whitespaceDatasource}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});