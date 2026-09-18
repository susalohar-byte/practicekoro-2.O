import { describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorBoundary, isChunkLoadError } from './ErrorBoundary';

const Boom = () => {
  throw new Error('kaboom');
};

describe('isChunkLoadError', () => {
  it('detects stale-deployment chunk failures', () => {
    expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module: /a.js'))).toBe(
      true
    );
    expect(isChunkLoadError('Loading chunk 12 failed.')).toBe(true);
    expect(isChunkLoadError(new Error('Importing a module script failed.'))).toBe(true);
  });

  it('ignores ordinary render errors and non-errors', () => {
    expect(isChunkLoadError(new Error('kaboom'))).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError(42)).toBe(false);
  });
});

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>safe content</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('safe content')).toBeTruthy();
  });

  it('renders the bilingual fallback instead of blanking the app', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary area="exam page">
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('কিছু একটা ভুল হয়েছে')).toBeTruthy();
    expect(screen.getByText(/kaboom/)).toBeTruthy();
    // Recovery affordances must always be offered
    expect(screen.getByRole('button', { name: /আবার চেষ্টা করুন/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Reload/ })).toBeTruthy();
  });

  it('recovers when retry is pressed after the fault is cleared', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;
    const Flaky = () => {
      if (shouldThrow) throw new Error('transient');
      return <p>recovered</p>;
    };

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );
    expect(screen.getByText('কিছু একটা ভুল হয়েছে')).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /আবার চেষ্টা করুন/ }));
    expect(screen.getByText('recovered')).toBeTruthy();
  });

  it('uses a custom fallback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>custom fallback</p>}>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('custom fallback')).toBeTruthy();
  });
});