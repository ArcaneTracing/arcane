import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentErrorBoundary } from '@/components/ComponentErrorBoundary';
import { Thrower, createOneTimeThrower } from '@/__tests__/test-utils-error-handling';

describe('ComponentErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when they do not throw', () => {
    render(
      <ComponentErrorBoundary>
        <div>Content</div>
      </ComponentErrorBoundary>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong here')).not.toBeInTheDocument();
  });

  it('shows CompactErrorFallback when a child throws', () => {
    render(
      <ComponentErrorBoundary>
        <Thrower />
      </ComponentErrorBoundary>
    );
    expect(screen.getByText('Something went wrong here')).toBeInTheDocument();
    expect(screen.getByText('Test render error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onError with error and info when a child throws', () => {
    const onError = jest.fn();
    render(
      <ComponentErrorBoundary onError={onError}>
        <Thrower />
      </ComponentErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('passes scope into onError as info.scope when scope is set', () => {
    const onError = jest.fn();
    render(
      <ComponentErrorBoundary onError={onError} scope="TraceGraph">
        <Thrower />
      </ComponentErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String), scope: 'TraceGraph' })
    );
  });

  it('Retry resets and re-renders children; recoverable with createOneTimeThrower', async () => {

    const user = userEvent.setup();
    const OneTimeThrower = createOneTimeThrower();


    const onRecoverableError = jest.fn((error: Error) => {


    });


    render(
      <ComponentErrorBoundary>
        <OneTimeThrower />
      </ComponentErrorBoundary>,
      {
        reactOptions: {
          onRecoverableError
        }
      }
    );
    await waitFor(
      async () => {
        const recovered = screen.queryByText('Recovered');
        if (recovered) {
          return recovered;
        }

        const fallback = screen.queryByText('Something went wrong here');
        const retryButton = screen.queryByRole('button', { name: /retry/i });

        if (fallback && retryButton) {

          await user.click(retryButton);
          return true;
        }


        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error('Waiting for recovery or fallback...');
      },
      { timeout: 3000 }
    );


    await waitFor(
      () => {
        expect(screen.getByText('Recovered')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('respects custom FallbackComponent', () => {
    const Custom = () => <div data-testid="custom-fallback">Custom</div>;
    render(
      <ComponentErrorBoundary FallbackComponent={Custom}>
        <Thrower />
      </ComponentErrorBoundary>
    );
    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('Custom');
    expect(screen.queryByText('Something went wrong here')).not.toBeInTheDocument();
  });

  it('respects fallback (ReactNode)', () => {
    render(
      <ComponentErrorBoundary fallback={<div data-testid="static">Static</div>}>
        <Thrower />
      </ComponentErrorBoundary>
    );
    expect(screen.getByTestId('static')).toHaveTextContent('Static');
  });

  it('respects fallbackRender', () => {
    render(
      <ComponentErrorBoundary
        fallbackRender={({ error }) => <span data-testid="render">{(error as Error).message}</span>}>

        <Thrower />
      </ComponentErrorBoundary>
    );
    expect(screen.getByTestId('render')).toHaveTextContent('Test render error');
  });
});