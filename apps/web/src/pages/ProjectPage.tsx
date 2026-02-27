// ============================================
// Groundwork - Project Page
// ============================================

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Stack,
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
import BrushIcon from '@mui/icons-material/Brush';
import TuneIcon from '@mui/icons-material/Tune';
import type { ProjectSections } from '@groundwork/types';
import { getProgressLabel, exportToMarkdown, exportToAIContext, exportToJSON } from '@groundwork/logic';
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
  const projects = useAppStore((s) => s.projects);
  const updateProject = useAppStore((s) => s.updateProject);
  const [activeTab, setActiveTab] = useState(0);

  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    if (!project && id) {
      navigate('/');
    }
  }, [project, id, navigate]);

  if (!project) return null;

  const handleNameChange = (name: string) => {
    updateProject(project.id, { name });
  };

  const handleDescriptionChange = (description: string) => {
    updateProject(project.id, { description });
  };

  const handleExport = (format: 'markdown' | 'ai-context' | 'json') => {
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
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    // Delay revocation to ensure the download has started
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const progressColor =
    project.progress < 30 ? 'error' : project.progress < 70 ? 'warning' : 'success';

  const allTabs: { label: string; key: keyof ProjectSections }[] = [
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
  ];

  const disabled = project.disabledSections || [];
  const visibleTabs = allTabs.filter((t) => !disabled.includes(t.key));

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
            value={project.name}
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
            value={project.description}
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
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(theme.palette[progressColor].main, 0.12),
          }}
        />
      </Card>

      {/* Actions */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 4, flexWrap: 'wrap' }}>
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
      </Stack>

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
          onChange={(_, v) => setActiveTab(v)}
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
          <ProblemSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'personas' && (
          <PersonasSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'competitors' && (
          <CompetitorsSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'features' && (
          <FeaturesSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'dataModel' && (
          <DataModelSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'stack' && (
          <StackSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'screens' && (
          <ScreensSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'architecture' && (
          <ArchitectureSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'milestones' && (
          <MilestonesSection project={project} onUpdate={updateProject} />
        )}
        {visibleTabs[activeTab]?.key === 'decisions' && (
          <DecisionsSection project={project} onUpdate={updateProject} />
        )}
      </Box>
    </Box>
  );
}
