// ============================================
// Groundwork - Root App Component
// ============================================

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { buildTheme } from './theme';
import { useAppStore } from './store';
import { useAuthStore } from './stores/authStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy-load heavy pages to reduce initial bundle (#51)
const CanvasPage = lazy(() => import('./pages/CanvasPage').then((m) => ({ default: m.CanvasPage })));
const ProjectPage = lazy(() => import('./pages/ProjectPage').then((m) => ({ default: m.ProjectPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress />
  </Box>
);

function useResolvedTheme() {
  const themePref = useAppStore((s) => s.preferences.theme);
  const colorScheme = useAppStore((s) => s.preferences.colorScheme);

  // Track system dark mode reactively
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return useMemo(() => {
    let mode: 'light' | 'dark' = 'light';

    if (themePref === 'dark') {
      mode = 'dark';
    } else if (themePref === 'system') {
      mode = systemDark ? 'dark' : 'light';
    }

    return buildTheme(colorScheme ?? 'purple', mode);
  }, [themePref, colorScheme, systemDark]);
}

export default function App() {
  const theme = useResolvedTheme();
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/project/:id" element={<Suspense fallback={<PageLoader />}><ProjectPage /></Suspense>} />
              <Route path="/project/:id/canvas" element={<Suspense fallback={<PageLoader />}><CanvasPage /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
