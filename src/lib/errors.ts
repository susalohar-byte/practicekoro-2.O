export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = Reflect.get(error, 'message');
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

/**
 * Maps raw Supabase Auth errors to user-friendly production copy.
 * Never leaks internals; guides the user to the next correct action.
 */
export function mapAuthError(error: unknown, fallback: string): string {
  const raw = getErrorMessage(error, '').toLowerCase();
  if (!raw) return fallback;
  if (raw.includes('invalid login credentials')) {
    return 'Incorrect email or password. If you just registered, please verify your email first, then try again.';
  }
  if (raw.includes('email not confirmed')) {
    return 'Your email is not verified yet. Please check your inbox for the verification link, then sign in.';
  }
  if (raw.includes('user already registered') || raw.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (raw.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (raw.includes('rate limit') || raw.includes('too many requests')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (raw.includes('network') || raw.includes('fetch') || raw.includes('failed to fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  return getErrorMessage(error, fallback);
}
