// ============================================
// Groundwork - Decisions Section Component
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
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { createDecision } from '@groundwork/logic';
import type { Decision, Project } from '@groundwork/types';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export function DecisionsSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { decisions } = project.sections;
  const [newTitle, setNewTitle] = useState('');

  const updateDecisions = (updated: Decision[]) => {
    onUpdate(project.id, {
      sections: { ...project.sections, decisions: updated },
    });
  };

  const addDecision = () => {
    if (!newTitle.trim()) return;
    updateDecisions([...decisions, createDecision(newTitle.trim())]);
    setNewTitle('');
  };

  const removeDecision = (id: string) => {
    updateDecisions(decisions.filter((d) => d.id !== id));
  };

  const updateDecision = (id: string, updates: Partial<Decision>) => {
    updateDecisions(decisions.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GavelIcon sx={{ color: 'warning.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Decisions Log
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Track key decisions and their reasoning. Future-you will thank you for documenting why you
        chose one approach over another.
      </Typography>

      <Card sx={{ p: 2.5, mb: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Decision title (e.g. Database choice, Auth strategy)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDecision()}
            fullWidth
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={addDecision} sx={{ whiteSpace: 'nowrap' }}>
            Add
          </Button>
        </Stack>
      </Card>

      <Stack spacing={2}>
        {decisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            onUpdate={(updates) => updateDecision(decision.id, updates)}
            onRemove={() => removeDecision(decision.id)}
          />
        ))}
        {decisions.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No decisions logged yet. Record important choices you make during planning.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function DecisionCard({
  decision,
  onUpdate,
  onRemove,
}: {
  decision: Decision;
  onUpdate: (updates: Partial<Decision>) => void;
  onRemove: () => void;
}) {
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    if (!newOption.trim()) return;
    onUpdate({ options: [...decision.options, newOption.trim()] });
    setNewOption('');
  };

  const removeOption = (index: number) => {
    const removedOption = decision.options[index];
    const updated = decision.options.filter((_, i) => i !== index);
    const chosenRemoved = decision.chosen === removedOption;
    onUpdate({
      options: updated,
      ...(chosenRemoved ? { chosen: undefined } : {}),
    });
  };

  const chooseOption = (index: number) => {
    const option = decision.options[index];
    onUpdate({ chosen: decision.chosen === option ? undefined : option });
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <TextField
          size="small"
          label="Decision"
          value={decision.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          sx={{ flex: 1, mr: 2 }}
        />
        <Tooltip title="Remove decision">
          <IconButton size="small" onClick={onRemove} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Options */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Options
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
        {decision.options.map((option, i) => {
          const isChosen = decision.chosen === option;
          return (
            <Chip
              key={`${i}-${option}`}
              label={option}
              size="small"
              icon={isChosen ? <CheckCircleIcon /> : undefined}
              color={isChosen ? 'success' : 'default'}
              variant={isChosen ? 'filled' : 'outlined'}
              onClick={() => chooseOption(i)}
              onDelete={() => removeOption(i)}
              sx={{ cursor: 'pointer' }}
            />
          );
        })}
      </Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Add an option..."
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { addOption(); }
          }}
          fullWidth
        />
        <Button size="small" variant="outlined" onClick={addOption}>
          Add
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Reasoning */}
      <TextField
        size="small"
        label="Reasoning"
        placeholder="Why did you choose this option? What tradeoffs?"
        value={decision.reasoning || ''}
        onChange={(e) => onUpdate({ reasoning: e.target.value })}
        multiline
        rows={2}
        fullWidth
      />

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {new Date(decision.date).toLocaleDateString()}
      </Typography>
    </Card>
  );
}
