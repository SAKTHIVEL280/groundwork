// ============================================
// Groundwork - Canvas Page
// ============================================

import { useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Excalidraw, MainMenu, WelcomeScreen, THEME } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types';
import { useAppStore } from '../store';
import { DRAWER_WIDTH } from '../components/Layout';

export function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const projects = useAppStore((s) => s.projects);
  const updateProject = useAppStore((s) => s.updateProject);
  const project = projects.find((p) => p.id === id);
  const isDark = theme.palette.mode === 'dark';

  // Use refs to avoid stale closures in debounced callback
  const projectRef = useRef(project);
  projectRef.current = project;
  const updateRef = useRef(updateProject);
  updateRef.current = updateProject;

  // Debounce timer ref to avoid excessive saves
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear pending debounce on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState, _files: BinaryFiles) => {
      if (!projectRef.current) return;

      // Debounce saves to avoid excessive writes
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const p = projectRef.current;
        if (!p) return;
        updateRef.current(p.id, {
          canvas: {
            ...p.canvas,
            snapshot: {
              elements,
              appState: { viewBackgroundColor: appState.viewBackgroundColor },
              // Omit binary files to prevent localStorage quota overflow
            },
          },
        });
      }, 500);
    },
    [],
  );

  // Navigate away if project not found (in useEffect, not during render)
  useEffect(() => {
    if (!project && id) {
      navigate('/');
    }
  }, [project, id, navigate]);

  if (!project) {
    return null;
  }

  const savedSnapshot = project.canvas?.snapshot;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: { xs: 0, md: `${DRAWER_WIDTH}px` },
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        zIndex: 1,
      }}
    >
      {/* Canvas Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(12px)',
          zIndex: 10,
        }}
      >
        <Tooltip title="Back to project">
          <IconButton
            onClick={() => navigate(`/project/${id}`)}
            size="small"
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }} noWrap>
          {project.name || 'Untitled'} — Canvas
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewListIcon />}
            onClick={() => navigate(`/project/${id}`)}
          >
            Sections
          </Button>
        </Stack>
      </Box>

      {/* Canvas */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Excalidraw
          initialData={savedSnapshot ? {
            elements: savedSnapshot.elements,
            appState: savedSnapshot.appState,
            files: savedSnapshot.files,
          } : undefined}
          onChange={handleChange}
          theme={isDark ? THEME.DARK : THEME.LIGHT}
          name={project.name || 'Untitled'}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: false,
              loadScene: false,
              export: false,
            },
          }}
        >
          {/* Custom main menu — removes Excalidraw socials/links */}
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
            <MainMenu.DefaultItems.Help />
          </MainMenu>

          {/* Custom welcome screen — removes Excalidraw branding */}
          <WelcomeScreen>
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.HelpHint />
          </WelcomeScreen>
        </Excalidraw>
      </Box>
    </Box>
  );
}
