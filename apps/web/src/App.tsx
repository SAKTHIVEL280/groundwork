// ============================================
// Groundwork - Root App Component
// ============================================

import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from './theme';
import { useAppStore } from './store';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';
import { CanvasPage } from './pages/CanvasPage';
import { SettingsPage } from './pages/SettingsPage';

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/project/:id/canvas" element={<CanvasPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
