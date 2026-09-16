import { describe, expect, it } from 'vitest';
import { canRestoreCachedUser, resolveDemoRole } from './authPolicy';
describe('authentication policy', () => {
  it('restores cache only in demo mode', () => {
    expect(canRestoreCachedUser(true)).toBe(true);
    expect(canRestoreCachedUser(false)).toBe(false);
  });
  it('blocks partial admin matches', () => {
    expect(resolveDemoRole('not-admin@example.com')).toBe('student');
    expect(resolveDemoRole('admin.attacker@example.com')).toBe('student');
  });
  it('accepts exact demo admin', () => {
    expect(resolveDemoRole('ADMIN@PRACTICEKORO.COM')).toBe('admin');
    expect(resolveDemoRole('admin@practicekoro.online')).toBe('admin');
    expect(resolveDemoRole('ADMIN@PRACTICEKORO.ONLINE')).toBe('admin');
  });
});
