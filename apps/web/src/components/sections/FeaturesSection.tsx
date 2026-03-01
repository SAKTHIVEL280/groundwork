// ============================================
// Groundwork - Features Section Component
// ============================================

import { memo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExtensionIcon from '@mui/icons-material/Extension';
import StarIcon from '@mui/icons-material/Star';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { createFeature } from '@groundwork/logic';
import type { Feature, Priority, Effort, Project } from '@groundwork/types';
import { useAI } from '../../hooks/useAI';
import { AIAssistButton } from '../AIAssistButton';
import { MarkdownContent } from '../MarkdownContent';
import { useAppStore } from '../../store';
import { DebouncedTextField } from '../DebouncedTextField';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

const PRIORITY_COLORS: Record<Priority, 'success' | 'warning' | 'default'> = {
  mvp: 'success',
  later: 'warning',
  cut: 'default',
};

const EFFORT_LABELS: Record<Effort, string> = {
  small: 'S',
  medium: 'M',
  large: 'L',
};

export const FeaturesSection = memo(function FeaturesSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { features } = project.sections;
  const [newFeatureName, setNewFeatureName] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const ai = useAI();

  const updateFeatures = (updated: Feature[]) => {
    // Read latest sections from store to prevent stale closure overwrites
    const latestProject = useAppStore.getState().projects.find(p => p.id === project.id);
    const currentSections = latestProject?.sections ?? project.sections;
    onUpdate(project.id, {
      sections: { ...currentSections, features: updated },
    });
  };

  const addFeature = () => {
    if (!newFeatureName.trim()) return;
    const feature = createFeature(newFeatureName.trim());
    updateFeatures([...features, feature]);
    setNewFeatureName('');
  };

  const handleAISuggest = async () => {
    const desc = `${project.name}. ${project.description}. ${project.sections.problem.statement}`;
    const result = await ai.suggestFeatures(desc);
    if (!result) return;
    try {
      const cleaned = result.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        const newFeatures = parsed.map((f: { name: string; description?: string }) =>
          createFeature(f.name, f.description || ''),
        );
        // Read latest features from store to avoid stale closure
        const currentProject = useAppStore.getState().projects.find((p) => p.id === project.id);
        const currentFeatures = currentProject?.sections.features ?? features;
        updateFeatures([...currentFeatures, ...newFeatures]);
      }
    } catch {
      // JSON parse failed — show raw AI text as fallback
      setParseError(result);
    }
  };

  const removeFeature = (id: string) => {
    updateFeatures(features.filter((f) => f.id !== id));
  };

  const updateFeature = (id: string, updates: Partial<Feature>) => {
    updateFeatures(
      features.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  const cyclePriority = (current: Priority): Priority => {
    const order: Priority[] = ['mvp', 'later', 'cut'];
    return order[(order.indexOf(current) + 1) % order.length];
  };

  const cycleEffort = (current: Effort): Effort => {
    const order: Effort[] = ['small', 'medium', 'large'];
    return order[(order.indexOf(current) + 1) % order.length];
  };

  const mvpFeatures = features.filter((f) => f.priority === 'mvp');
  const laterFeatures = features.filter((f) => f.priority === 'later');
  const cutFeatures = features.filter((f) => f.priority === 'cut');

  const renderFeature = (feature: Feature) => (
    <Card key={feature.id} sx={{ mb: 1.5 }}>
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <DebouncedTextField
            value={feature.name}
            onChange={(value) => updateFeature(feature.id, { name: value })}
            variant="standard"
            placeholder="Feature name"
            InputProps={{ disableUnderline: true, sx: { fontWeight: 600, fontSize: '0.95rem' } }}
            fullWidth
            size="small"
          />
          <DebouncedTextField
            value={feature.description}
            onChange={(value) => updateFeature(feature.id, { description: value })}
            variant="standard"
            placeholder="Brief description..."
            InputProps={{ disableUnderline: true, sx: { fontSize: '0.825rem', color: 'text.secondary' } }}
            fullWidth
            size="small"
          />
          <DebouncedTextField
            value={feature.notes || ''}
            onChange={(value) => updateFeature(feature.id, { notes: value })}
            variant="standard"
            placeholder="Notes..."
            InputProps={{ disableUnderline: true, sx: { fontSize: '0.775rem', color: 'text.secondary', fontStyle: 'italic' } }}
            fullWidth
            size="small"
          />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Click to cycle priority">
            <Chip
              icon={feature.priority === 'mvp' ? <StarIcon /> : feature.priority === 'later' ? <ScheduleIcon /> : <RemoveCircleOutlineIcon />}
              label={feature.priority.toUpperCase()}
              color={PRIORITY_COLORS[feature.priority]}
              size="small"
              onClick={() => updateFeature(feature.id, { priority: cyclePriority(feature.priority) })}
              sx={{ cursor: 'pointer', minWidth: 56, fontWeight: 700 }}
            />
          </Tooltip>
          <Tooltip title="Click to cycle effort (S/M/L)">
            <Chip
              label={EFFORT_LABELS[feature.effort]}
              variant="outlined"
              size="small"
              onClick={() => updateFeature(feature.id, { effort: cycleEffort(feature.effort) })}
              sx={{ cursor: 'pointer', fontWeight: 700, minWidth: 36 }}
            />
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => removeFeature(feature.id)}
            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            aria-label={`Delete feature ${feature.name}`}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );

  const renderGroup = (
    label: string,
    items: Feature[],
    color: string,
  ) => {
    if (items.length === 0) return null;
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box sx={{ width: 4, height: 16, borderRadius: 2, bgcolor: color }} />
          <Typography variant="subtitle2" sx={{ color, fontWeight: 700 }}>
            {label} ({items.length})
          </Typography>
        </Box>
        {items.map(renderFeature)}
      </Box>
    );
  };

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ExtensionIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Features
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        List everything you want to build, then categorize: MVP (build first), Later (v2+), or Cut.
        Click the chips to cycle priority & effort.
      </Typography>

      {/* Add Feature */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          value={newFeatureName}
          onChange={(e) => setNewFeatureName(e.target.value)}
          placeholder="Add a feature..."
          size="small"
          fullWidth
          onKeyDown={(e) => e.key === 'Enter' && addFeature()}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addFeature}
          disabled={!newFeatureName.trim()}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add
        </Button>
      </Stack>

      <AIAssistButton
        label="AI Suggest Features"
        loading={ai.loading}
        error={ai.error}
        onGenerate={handleAISuggest}
        onClearError={ai.clearError}
      />

      <Collapse in={!!parseError}>
        <Alert severity="info" onClose={() => setParseError(null)} sx={{ mt: 1, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>AI Suggestion</Typography>
          <MarkdownContent content={parseError ?? ''} />
        </Alert>
      </Collapse>

      {features.length > 0 && <Divider sx={{ mb: 3, mt: 2 }} />}

      {/* Feature Groups */}
      {renderGroup('MVP', mvpFeatures, theme.palette.success.main)}
      {renderGroup('Later', laterFeatures, theme.palette.warning.main)}
      {renderGroup('Cut', cutFeatures, theme.palette.text.secondary)}

      {features.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No features yet. Start adding what you want to build.
        </Typography>
      )}
    </Box>
  );
});
