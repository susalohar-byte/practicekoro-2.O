/**
 * Build-time environment gate. Vite bakes VITE_* values into the bundle, so
 * a build made without them can never connect — main.tsx checks this BEFORE
 * importing any app module (whose top-level throw would otherwise leave a
 * white screen with React never mounted).
 */
export function isSupabaseEnvValid(env: {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}): boolean {
  const url = env.VITE_SUPABASE_URL?.trim();
  const key = env.VITE_SUPABASE_ANON_KEY?.trim();
  return Boolean(
    url &&
      key &&
      url.startsWith('http') &&
      !url.includes('your-project-ref') &&
      !url.includes('placeholder')
  );
}
