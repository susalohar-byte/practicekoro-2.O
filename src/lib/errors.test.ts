import { describe, expect, it } from 'vitest';
import { getErrorMessage, mapAuthError } from './errors';

describe('getErrorMessage', () => {
  it('extracts Error messages and falls back', () => {
    expect(getErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getErrorMessage({ message: 'm' }, 'fb')).toBe('m');
    expect(getErrorMessage(null, 'fb')).toBe('fb');
  });
});

describe('mapAuthError', () => {
  it('maps invalid credentials to friendly copy', () => {
    expect(mapAuthError(new Error('Invalid login credentials'), 'fb')).toContain(
      'Incorrect email or password'
    );
  });

  it('maps unconfirmed email to inbox guidance', () => {
    expect(mapAuthError(new Error('Email not confirmed'), 'fb')).toContain('inbox');
  });

  it('maps existing accounts to sign-in guidance', () => {
    expect(mapAuthError(new Error('User already registered'), 'fb')).toContain('sign in');
  });

  it('maps weak passwords and rate limits', () => {
    expect(mapAuthError(new Error('Password should be at least 6 characters'), 'fb')).toContain(
      '6 characters'
    );
    expect(mapAuthError(new Error('Rate limit exceeded'), 'fb')).toContain('wait a minute');
  });

  it('falls back for unknown errors', () => {
    expect(mapAuthError(new Error('Something odd'), 'fb')).toBe('Something odd');
    expect(mapAuthError(null, 'fb')).toBe('fb');
  });
});
