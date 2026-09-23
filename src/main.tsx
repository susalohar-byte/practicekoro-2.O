import './index.css';
import { isSupabaseEnvValid } from '@/utils/envGate';

/**
 * Environment gate: runs BEFORE any app module (in particular
 * src/lib/supabase.ts, which throws on missing config) is evaluated.
 * Static imports would evaluate the whole chain first and leave a white
 * screen, so the app shell is loaded dynamically only after validation.
 */

function renderConfigError(): void {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f1f5f9;padding:24px;font-family:system-ui,-apple-system,sans-serif;">
      <div style="max-width:520px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,.08);text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">&#9888;&#65039;</div>
        <h1 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 8px;">PracticeKoro is not configured</h1>
        <p style="font-size:14px;color:#475569;margin:0 0 16px;line-height:1.6;">
          This build is missing its Supabase connection settings
          (<code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_ANON_KEY</code>).
          They are baked in at build time — rebuilding with a valid
          <code>.env</code> file fixes this page.
        </p>
        <p style="font-size:12px;color:#94a3b8;margin:0;">Error: Supabase configuration missing</p>
      </div>
    </div>`;
}

async function bootstrap(): Promise<void> {
  if (!isSupabaseEnvValid(import.meta.env as Record<string, string | undefined>)) {
    renderConfigError();
    return;
  }

  const [
    { default: React },
    { createRoot },
    { BrowserRouter },
    { QueryClient, QueryClientProvider },
    { AuthProvider },
    { ExamProvider },
    { ThemeProvider },
    { MaintenanceProvider },
    { ErrorBoundary },
    { App },
  ] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('react-router-dom'),
    import('@tanstack/react-query'),
    import('@/context/AuthContext'),
    import('@/context/ExamContext'),
    import('@/context/ThemeContext'),
    import('@/context/MaintenanceContext'),
    import('@/components/common/ErrorBoundary'),
    import('./App'),
  ]);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  });

  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary area="PracticeKoro">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <ExamProvider>
                  <MaintenanceProvider>
                    <App />
                  </MaintenanceProvider>
                </ExamProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

void bootstrap();

// Register the offline service worker in production builds only.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration skipped:', err);
    });
  });
}
