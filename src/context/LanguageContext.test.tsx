import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage, LANGUAGE_STORAGE_KEY } from './LanguageContext';

function Probe() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="hero">{t('hero.eyebrow')}</span>
      <span data-testid="missing">{t('nope.missing.key')}</span>
      <button type="button" onClick={() => setLang('en')}>
        to-en
      </button>
      <button type="button" onClick={() => setLang('bn')}>
        to-bn
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('LanguageContext', () => {
  it('defaults to Bengali-first when nothing is stored', () => {
    renderWithProvider();
    expect(screen.getByTestId('lang').textContent).toBe('bn');
    expect(screen.getByTestId('hero').textContent).toBe('পশ্চিমবঙ্গের #১ সরকারি চাকরি প্র্যাকটিস প্ল্যাটফর্ম');
  });

  it('restores the stored language and switches with persistence', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    renderWithProvider();
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('hero').textContent).toBe(
      "West Bengal's #1 Govt Exam Practice Platform"
    );

    await act(async () => {
      fireEvent.click(screen.getByText('to-bn'));
    });
    expect(screen.getByTestId('lang').textContent).toBe('bn');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('bn');
  });

  it('falls back to the key itself for unknown paths', () => {
    renderWithProvider();
    expect(screen.getByTestId('missing').textContent).toBe('nope.missing.key');
  });

  it('works without a provider (read-only stored default, no throw)', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    render(<Probe />);
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('hero').textContent).toBe(
      "West Bengal's #1 Govt Exam Practice Platform"
    );
  });
});
