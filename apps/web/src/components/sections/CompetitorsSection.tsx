// ============================================
// Groundwork - Competitors Section Component
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
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { createCompetitor } from '@groundwork/logic';
import type { Competitor, Project } from '@groundwork/types';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export function CompetitorsSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { competitors } = project.sections;
  const [newName, setNewName] = useState('');

  const updateCompetitors = (updated: Competitor[]) => {
    onUpdate(project.id, {
      sections: { ...project.sections, competitors: updated },
    });
  };

  const addCompetitor = () => {
    if (!newName.trim()) return;
    updateCompetitors([...competitors, createCompetitor(newName.trim())]);
    setNewName('');
  };

  const removeCompetitor = (id: string) => {
    updateCompetitors(competitors.filter((c) => c.id !== id));
  };

  const updateCompetitor = (id: string, updates: Partial<Competitor>) => {
    updateCompetitors(competitors.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addListItem = (competitorId: string, field: 'strengths' | 'gaps', value: string) => {
    if (!value.trim()) return;
    const comp = competitors.find((c) => c.id === competitorId);
    if (!comp) return;
    updateCompetitor(competitorId, { [field]: [...comp[field], value.trim()] });
  };

  const removeListItem = (competitorId: string, field: 'strengths' | 'gaps', index: number) => {
    const comp = competitors.find((c) => c.id === competitorId);
    if (!comp) return;
    updateCompetitor(competitorId, { [field]: comp[field].filter((_, i) => i !== index) });
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
          <CompareArrowsIcon sx={{ color: 'warning.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Competitor Analysis
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Know your competition. What do they do well? Where are the gaps you can fill?
      </Typography>

      <Card sx={{ p: 2.5, mb: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Competitor name (e.g. Notion, Linear)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
            fullWidth
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={addCompetitor} sx={{ whiteSpace: 'nowrap' }}>
            Add
          </Button>
        </Stack>
      </Card>

      <Stack spacing={2}>
        {competitors.map((comp) => (
          <CompetitorCard
            key={comp.id}
            competitor={comp}
            onUpdate={(updates) => updateCompetitor(comp.id, updates)}
            onRemove={() => removeCompetitor(comp.id)}
            onAddListItem={(field, value) => addListItem(comp.id, field, value)}
            onRemoveListItem={(field, index) => removeListItem(comp.id, field, index)}
          />
        ))}
        {competitors.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No competitors added yet. Research who else is solving this problem.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function CompetitorCard({
  competitor,
  onUpdate,
  onRemove,
  onAddListItem,
  onRemoveListItem,
}: {
  competitor: Competitor;
  onUpdate: (updates: Partial<Competitor>) => void;
  onRemove: () => void;
  onAddListItem: (field: 'strengths' | 'gaps', value: string) => void;
  onRemoveListItem: (field: 'strengths' | 'gaps', index: number) => void;
}) {
  const [strengthInput, setStrengthInput] = useState('');
  const [gapInput, setGapInput] = useState('');

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Stack spacing={1.5} sx={{ flex: 1, mr: 2 }}>
          <TextField
            size="small"
            label="Name"
            value={competitor.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            fullWidth
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              label="URL"
              placeholder="https://..."
              value={competitor.url || ''}
              onChange={(e) => onUpdate({ url: e.target.value })}
              fullWidth
            />
            {competitor.url && (
              <Tooltip title="Open in new tab">
                <IconButton
                  size="small"
                  onClick={() => window.open(competitor.url, '_blank', 'noopener')}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Tooltip title="Remove competitor">
          <IconButton size="small" onClick={onRemove} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Strengths */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.main' }}>
        Strengths
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
        {competitor.strengths.map((s, i) => (
          <Chip key={`${i}-${s}`} label={s} size="small" onDelete={() => onRemoveListItem('strengths', i)} color="success" variant="outlined" />
        ))}
      </Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Add a strength..."
          value={strengthInput}
          onChange={(e) => setStrengthInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onAddListItem('strengths', strengthInput); setStrengthInput(''); }
          }}
          fullWidth
        />
        <Button size="small" variant="outlined" onClick={() => { onAddListItem('strengths', strengthInput); setStrengthInput(''); }}>
          Add
        </Button>
      </Stack>

      {/* Gaps */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.main' }}>
        Gaps / Weaknesses
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
        {competitor.gaps.map((g, i) => (
          <Chip key={`${i}-${g}`} label={g} size="small" onDelete={() => onRemoveListItem('gaps', i)} color="error" variant="outlined" />
        ))}
      </Box>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          placeholder="Add a gap..."
          value={gapInput}
          onChange={(e) => setGapInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onAddListItem('gaps', gapInput); setGapInput(''); }
          }}
          fullWidth
        />
        <Button size="small" variant="outlined" onClick={() => { onAddListItem('gaps', gapInput); setGapInput(''); }}>
          Add
        </Button>
      </Stack>
    </Card>
  );
}
