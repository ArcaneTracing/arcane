import React from 'react';
import { render, screen } from '@testing-library/react';
import { DatasourceSourceBadge } from '../datasource-source-badge';
import { DatasourceSource } from '@/types';

describe('DatasourceSourceBadge', () => {
  it('should render tempo source badge', () => {
    render(<DatasourceSourceBadge source={DatasourceSource.TEMPO} />);
    expect(screen.getByText(DatasourceSource.TEMPO)).toBeInTheDocument();
  });

  it('should render jaeger source badge', () => {
    render(<DatasourceSourceBadge source={DatasourceSource.JAEGER} />);
    expect(screen.getByText(DatasourceSource.JAEGER)).toBeInTheDocument();
  });

  it('should render default badge for unknown source', () => {
    render(<DatasourceSourceBadge source={'UNKNOWN' as DatasourceSource} />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });


  it('should handle empty string source', () => {
    const { container } = render(<DatasourceSourceBadge source={'' as DatasourceSource} />);

    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
  });

  it('should handle null source', () => {
    const { container } = render(<DatasourceSourceBadge source={null as any} />);

    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
  });

  it('should handle undefined source', () => {
    const { container } = render(<DatasourceSourceBadge source={undefined as any} />);

    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
  });

  it('should handle very long source name', () => {
    const longSource = 'a'.repeat(100) as DatasourceSource;
    render(<DatasourceSourceBadge source={longSource} />);
    expect(screen.getByText(longSource)).toBeInTheDocument();
  });

  it('should handle special characters in source', () => {
    const specialSource = 'Source!@#$%' as DatasourceSource;
    render(<DatasourceSourceBadge source={specialSource} />);
    expect(screen.getByText(specialSource)).toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    const { container } = render(<DatasourceSourceBadge source={DatasourceSource.TEMPO} />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-full');
  });
});