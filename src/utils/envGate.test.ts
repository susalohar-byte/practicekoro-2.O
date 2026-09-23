import { describe, expect, it } from 'vitest';
import { isSupabaseEnvValid } from './envGate';

describe('isSupabaseEnvValid', () => {
  it('accepts a real Supabase configuration', () => {
    expect(
      isSupabaseEnvValid({
        VITE_SUPABASE_URL: 'https://abc.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'some-key',
      })
    ).toBe(true);
  });

  it('rejects missing values', () => {
    expect(isSupabaseEnvValid({})).toBe(false);
    expect(isSupabaseEnvValid({ VITE_SUPABASE_URL: 'https://abc.supabase.co' })).toBe(false);
    expect(isSupabaseEnvValid({ VITE_SUPABASE_ANON_KEY: 'some-key' })).toBe(false);
  });

  it('rejects placeholders and non-http URLs', () => {
    expect(
      isSupabaseEnvValid({
        VITE_SUPABASE_URL: 'https://your-project-ref.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'x',
      })
    ).toBe(false);
    expect(
      isSupabaseEnvValid({ VITE_SUPABASE_URL: 'not-a-url', VITE_SUPABASE_ANON_KEY: 'x' })
    ).toBe(false);
  });
});
