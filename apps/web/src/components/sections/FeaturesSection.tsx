// ============================================
// Groundwork - Features Section Component
// ============================================

import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
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
import { createFeature } from '@groundwork/logic';
import type { Feature, Priority, Effort, Project } from '@groundwork/types';
import { useAI } from '../../hooks/useAI';
import { AIAssistButton } from '../AIAssistButton';
import { useAppStore } from '../../store';

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

export function FeaturesSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { features } = project.sections;
  const [newFeatureName, setNewFeatureName] = useState('');
  const ai = useAI();

  const updateFeatures = (updated: Feature[]) => {
    onUpdate(project.id, {
      sections: { ...project.sections, features: updated },
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
      const parsed = JSON.parse(result);
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
      // If parse fails, ignore
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
          <TextField
            value={feature.name}
            onChange={(e) => updateFeature(feature.id, { name: e.target.value })}
            variant="standard"
            placeholder="Feature name"
            InputProps={{ disableUnderline: true, sx: { fontWeight: 600, fontSize: '0.95rem' } }}
            fullWidth
            size="small"
          />
          <TextField
            value={feature.description}
            onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
            variant="standard"
            placeholder="Brief description..."
            InputProps={{ disableUnderline: true, sx: { fontSize: '0.825rem', color: 'text.secondary' } }}
            fullWidth
            size="small"
          />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Click to cycle priority">
            <Chip
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
        isAvailable={ai.isAvailable}
        onGenerate={handleAISuggest}
        onClearError={ai.clearError}
      />

      {features.length > 0 && <Divider sx={{ mb: 3, mt: 2 }} />}

      {/* Feature Groups */}
      {renderGroup('MVP', mvpFeatures, theme.palette.success.main)}
      {renderGroup('Later', laterFeatures, theme.palette.warning.main)}
      {renderGroup('Cut', cutFeatures, theme.palette.text.secondary)}

      {features.length === 0 && (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No features yet. Start adding what you want to build.
          </Typography>
        </Card>
      )}
    </Box>
  );
}
