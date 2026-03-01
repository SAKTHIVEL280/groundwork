// ============================================
// Groundwork - Decisions Section Component
// ============================================

import { memo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from '@mui/icons-material/Delete';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { createDecision } from '@groundwork/logic';
import type { Decision, Project } from '@groundwork/types';
import { useAI } from '../../hooks/useAI';
import { MarkdownContent } from '../MarkdownContent';
import { useAppStore } from '../../store';
import { DebouncedTextField } from '../DebouncedTextField';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export const DecisionsSection = memo(function DecisionsSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const ai = useAI();
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const { decisions } = project.sections;
  const [newTitle, setNewTitle] = useState('');

  const updateDecisions = (updated: Decision[]) => {
    // Read latest sections from store to prevent stale closure overwrites
    const latestProject = useAppStore.getState().projects.find(p => p.id === project.id);
    const currentSections = latestProject?.sections ?? project.sections;
    onUpdate(project.id, {
      sections: { ...currentSections, decisions: updated },
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

  const handleSuggestDecisions = async () => {
    const stackInfo = project.sections.stack;
    const context = [
      project.description,
      stackInfo.frontend && `Frontend: ${stackInfo.frontend}`,
      stackInfo.backend && `Backend: ${stackInfo.backend}`,
      stackInfo.database && `Database: ${stackInfo.database}`,
      stackInfo.hosting && `Hosting: ${stackInfo.hosting}`,
      stackInfo.auth && `Auth: ${stackInfo.auth}`,
    ].filter(Boolean).join('\n');

    const result = await ai.freeformAsk(
      `What key technical decisions should I make for this project?\n\n${context}`,
      'You are a senior tech lead. Suggest 3-5 important technical decisions a developer should make for the described project. For each, list the decision topic and 2-3 options to consider. Be concise.',
    );
    if (result) setAiSuggestion(result);
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
        <Button
          size="small"
          variant="outlined"
          startIcon={ai.loading ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
          onClick={handleSuggestDecisions}
          disabled={ai.loading}
          sx={{ ml: 'auto' }}
        >
          Suggest with AI
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Track key decisions and their reasoning. Future-you will thank you for documenting why you
        chose one approach over another.
      </Typography>

      <Collapse in={!!aiSuggestion || !!ai.error}>
        {ai.error && (
          <Alert severity="error" onClose={ai.clearError} sx={{ mb: 2, borderRadius: 2 }}>
            {ai.error}
          </Alert>
        )}
        {aiSuggestion && (
          <Alert
            severity="info"
            onClose={() => setAiSuggestion(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>AI Suggestion</Typography>
            <MarkdownContent content={aiSuggestion} />
          </Alert>
        )}
      </Collapse>

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
});

const DecisionCard = memo(function DecisionCard({
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
        <DebouncedTextField
          size="small"
          label="Decision"
          value={decision.title}
          onChange={(value) => onUpdate({ title: value })}
          sx={{ flex: 1, mr: 2 }}
        />
        <Tooltip title="Remove decision">
          <IconButton size="small" aria-label={`Remove decision ${decision.title}`} onClick={onRemove} color="error">
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
      <DebouncedTextField
        size="small"
        label="Reasoning"
        placeholder="Why did you choose this option? What tradeoffs?"
        value={decision.reasoning || ''}
        onChange={(value) => onUpdate({ reasoning: value })}
        multiline
        rows={2}
        fullWidth
      />

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {new Date(decision.date).toLocaleDateString()}
      </Typography>
    </Card>
  );
});
