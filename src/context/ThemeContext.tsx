import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'pk_theme';

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function resolve(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

function applyToDocument(resolved: 'light' | 'dark', animate = false) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-anim');
    window.setTimeout(() => root.classList.remove('theme-anim'), 320);
  }
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  // Keep the browser UI (mobile chrome bar, PWA shell) in sync
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = resolved === 'dark' ? '#0b1120' : '#4f46e5';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      // Ignore inaccessible storage
    }
    return 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolve(theme));

  // Apply on every change (animated; first mount applies silently)
  const firstRun = React.useRef(true);
  useEffect(() => {
    const resolved = resolve(theme);
    setResolvedTheme(resolved);
    applyToDocument(resolved, !firstRun.current);
    firstRun.current = false;
  }, [theme]);

  // Track OS preference while in 'system' mode
  useEffect(() => {
    if (theme !== 'system' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const resolved = resolve('system');
      setResolvedTheme(resolved);
      applyToDocument(resolved);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore inaccessible storage
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
