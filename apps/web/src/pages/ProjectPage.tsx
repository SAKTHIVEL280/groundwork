// ============================================
// Groundwork - Project Page
// ============================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ArticleIcon from '@mui/icons-material/Article';
import BrushIcon from '@mui/icons-material/Brush';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CelebrationIcon from '@mui/icons-material/Celebration';
import type { ProjectSections } from '@groundwork/types';
import { getProgressLabel, exportToMarkdown, exportToAIContext, exportToJSON, exportToPRD } from '@groundwork/logic';
import { useAppStore } from '../store';
import { ProblemSection } from '../components/sections/ProblemSection';
import { PersonasSection } from '../components/sections/PersonasSection';
import { CompetitorsSection } from '../components/sections/CompetitorsSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { DataModelSection } from '../components/sections/DataModelSection';
import { StackSection } from '../components/sections/StackSection';
import { ScreensSection } from '../components/sections/ScreensSection';
import { ArchitectureSection } from '../components/sections/ArchitectureSection';
import { MilestonesSection } from '../components/sections/MilestonesSection';
import { DecisionsSection } from '../components/sections/DecisionsSection';

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  // Focused selector: only re-renders when THIS project changes, not other projects
  const project = useAppStore((s) => s.projects.find((p) => p.id === id));
  const updateProject = useAppStore((s) => s.updateProject);
  const duplicateProject = useAppStore((s) => s.duplicateProject);

  // Tab persistence per project
  const savedTab = id ? Number(sessionStorage.getItem(`gw-tab-${id}`) || '0') : 0;
  const [activeTab, setActiveTab] = useState(savedTab);
  const handleTabChange = (_: unknown, v: number) => {
    setActiveTab(v);
    if (id) sessionStorage.setItem(`gw-tab-${id}`, String(v));
  };

  // Snackbar for export/copy feedback
  const [snackMsg, setSnackMsg] = useState('');

  // Auto-save indicator
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Completion celebration (#44)
  const [showCelebration, setShowCelebration] = useState(false);
  const prevProgressRef = useRef<number | null>(null);

  // Debounced local state for name and description
  const [localName, setLocalName] = useState(project?.name ?? '');
  const [localDesc, setLocalDesc] = useState(project?.description ?? '');
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const descTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when project changes externally (e.g. navigate to different project)
  useEffect(() => {
    if (project) {
      setLocalName(project.name);
      setLocalDesc(project.description);
      const stored = Number(sessionStorage.getItem(`gw-tab-${project.id}`) || '0');
      setActiveTab(stored);
    }
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
      if (descTimerRef.current) clearTimeout(descTimerRef.current);
    };
  }, []);

  // Keyboard shortcut: Escape to go back (#25)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only if no dialog/menu is open and no input is focused
      if (e.key === 'Escape' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  // Completion celebration: show when progress transitions to 100%
  useEffect(() => {
    if (!project) return;
    if (prevProgressRef.current !== null && prevProgressRef.current < 100 && project.progress === 100) {
      setShowCelebration(true);
    }
    prevProgressRef.current = project.progress;
  }, [project?.progress]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNameChange = useCallback(
    (name: string) => {
      setLocalName(name);
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
      nameTimerRef.current = setTimeout(() => {
        if (project) updateProject(project.id, { name });
      }, 400);
    },
    [project, updateProject],
  );

  const handleDescriptionChange = useCallback(
    (description: string) => {
      setLocalDesc(description);
      if (descTimerRef.current) clearTimeout(descTimerRef.current);
      descTimerRef.current = setTimeout(() => {
        if (project) updateProject(project.id, { description });
      }, 400);
    },
    [project, updateProject],
  );

  useEffect(() => {
    if (!project && id) {
      navigate('/');
    }
  }, [project, id, navigate]);

  if (!project) return null;

  const handleExport = (format: 'markdown' | 'ai-context' | 'json' | 'prd') => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'markdown':
          content = exportToMarkdown(project);
          filename = `${project.name || 'project'}-brief.md`;
          mimeType = 'text/markdown';
          break;
        case 'ai-context':
          content = exportToAIContext(project);
          filename = `${project.name || 'project'}-ai-context.md`;
          mimeType = 'text/markdown';
          break;
        case 'json':
          content = exportToJSON(project);
          filename = `${project.name || 'project'}.groundwork.json`;
          mimeType = 'application/json';
          break;
        case 'prd':
          content = exportToPRD(project);
          filename = `${project.name || 'project'}-prd.md`;
          mimeType = 'text/markdown';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setSnackMsg(`Exported ${filename}`);
    } catch (e) {
      console.error('Export failed:', e);
      setSnackMsg('Export failed');
    }
  };

  const handleCopyAIContext = async () => {
    try {
      const content = exportToAIContext(project);
      await navigator.clipboard.writeText(content);
      setSnackMsg('AI context copied to clipboard');
    } catch {
      setSnackMsg('Failed to copy');
    }
  };

  // Show auto-save indicator when project updates
  const handleUpdate = useCallback(
    (projectId: string, updates: Parameters<typeof updateProject>[1]) => {
      updateProject(projectId, updates);
      setSaved(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaved(false), 2000);
    },
    [updateProject],
  );

  const progressColor =
    project.progress < 30 ? 'error' : project.progress < 70 ? 'warning' : 'success';

  const allTabs: { label: string; key: keyof ProjectSections }[] = useMemo(() => [
    { label: 'Problem', key: 'problem' },
    { label: 'Personas', key: 'personas' },
    { label: 'Competitors', key: 'competitors' },
    { label: 'Features', key: 'features' },
    { label: 'Data Model', key: 'dataModel' },
    { label: 'Tech Stack', key: 'stack' },
    { label: 'Screens', key: 'screens' },
    { label: 'Architecture', key: 'architecture' },
    { label: 'Milestones', key: 'milestones' },
    { label: 'Decisions', key: 'decisions' },
  ], []);

  const disabled = project.disabledSections || [];
  const visibleTabs = useMemo(
    () => allTabs.filter((t) => !disabled.includes(t.key)),
    [allTabs, disabled],
  );

  const [sectionMenuAnchor, setSectionMenuAnchor] = useState<null | HTMLElement>(null);

  const toggleSection = (key: keyof ProjectSections) => {
    const current = project.disabledSections || [];
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    updateProject(project.id, { disabledSections: next });

    // Compute new visible tabs to fix the active tab index
    const newVisibleTabs = allTabs.filter((t) => !next.includes(t.key));
    const currentKey = visibleTabs[activeTab]?.key;
    if (!currentKey || next.includes(currentKey)) {
      // Currently selected tab was disabled — reset to first
      setActiveTab(0);
    } else {
      // Re-find index of the current tab in the new list
      const newIndex = newVisibleTabs.findIndex((t) => t.key === currentKey);
      setActiveTab(newIndex >= 0 ? newIndex : 0);
    }
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
        <Tooltip title="Back to Home">
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              mt: 0.5,
              border: 1,
              borderColor: 'divider',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            value={localName}
            onChange={(e) => handleNameChange(e.target.value)}
            variant="standard"
            placeholder="Project Name"
            InputProps={{
              sx: {
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                '&:hover:not(.Mui-focused)::before': {
                  borderBottomColor: 'divider',
                  borderBottomWidth: 1,
                  borderBottomStyle: 'solid',
                },
              },
              disableUnderline: false,
            }}
            fullWidth
            sx={{
              '& .MuiInput-underline::before': { borderBottom: 'none' },
              '& .MuiInput-underline::after': { borderBottomColor: 'primary.main' },
            }}
          />
          <TextField
            value={localDesc}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            variant="standard"
            placeholder="Add a description..."
            InputProps={{
              sx: { fontSize: '0.9rem', color: 'text.secondary', mt: 0.5 },
              disableUnderline: true,
            }}
            fullWidth
          />
        </Box>
      </Box>

      {/* Progress Bar */}
      <Card sx={{ mb: 4, p: 2.5, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>
              {getProgressLabel(project.progress)}
            </Typography>
            <Chip
              label={`${project.progress}%`}
              size="small"
              color={progressColor}
              sx={{ fontWeight: 700, minWidth: 48 }}
            />
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={project.progress}
          color={progressColor}
          sx={{
            bgcolor: alpha(theme.palette[progressColor].main, 0.12),
          }}
        />
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<BrushIcon />}
          onClick={() => navigate(`/project/${project.id}/canvas`)}
        >
          Open Canvas
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DescriptionIcon />}
          onClick={() => handleExport('markdown')}
        >
          Export Brief
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SmartToyIcon />}
          onClick={() => handleExport('ai-context')}
        >
          AI Context
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DataObjectIcon />}
          onClick={() => handleExport('json')}
        >
          Export JSON
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArticleIcon />}
          onClick={() => handleExport('prd')}
        >
          Export PRD
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={() => {
            const newId = duplicateProject(project.id);
            if (newId) navigate(`/project/${newId}`);
          }}
        >
          Duplicate
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentPasteIcon />}
          onClick={handleCopyAIContext}
        >
          Copy AI Context
        </Button>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 4,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flex: 1 }}
        >
          {visibleTabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>
        <Tooltip title="Configure visible sections">
          <IconButton
            size="small"
            onClick={(e) => setSectionMenuAnchor(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <TuneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={sectionMenuAnchor}
          open={Boolean(sectionMenuAnchor)}
          onClose={() => setSectionMenuAnchor(null)}
        >
          {allTabs.map((tab) => (
            <MenuItem key={tab.key} onClick={() => toggleSection(tab.key)} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={!disabled.includes(tab.key)}
                  size="small"
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText primary={tab.label} />
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Tab Content */}
      <Box sx={{ pb: 4 }}>
        {visibleTabs[activeTab]?.key === 'problem' && (
          <ProblemSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'personas' && (
          <PersonasSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'competitors' && (
          <CompetitorsSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'features' && (
          <FeaturesSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'dataModel' && (
          <DataModelSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'stack' && (
          <StackSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'screens' && (
          <ScreensSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'architecture' && (
          <ArchitectureSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'milestones' && (
          <MilestonesSection project={project} onUpdate={handleUpdate} />
        )}
        {visibleTabs[activeTab]?.key === 'decisions' && (
          <DecisionsSection project={project} onUpdate={handleUpdate} />
        )}
      </Box>

      {/* Auto-save indicator */}
      {saved && (
        <Box
          role="status"
          aria-live="polite"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            fontSize: '0.8rem',
            fontWeight: 600,
            boxShadow: 3,
            zIndex: 1200,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 16 }} />
          Saved
        </Box>
      )}

      {/* Snackbar for export/copy */}
      <Snackbar
        open={!!snackMsg}
        autoHideDuration={3000}
        onClose={() => setSnackMsg('')}
        message={snackMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Completion Celebration (#44) */}
      <Dialog
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
          <CelebrationIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
          <Typography variant="h5" fontWeight={700}>
            Project Complete! 🎉
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
          <Typography color="text.secondary">
            All sections of <strong>{project.name}</strong> are filled in. Your project plan is ready
            — export it and start building!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => setShowCelebration(false)}>
            Keep Editing
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowCelebration(false);
              handleExport('markdown');
            }}
          >
            Export Brief
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
