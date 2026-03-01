// ============================================
// Groundwork - Tech Stack Section Component
// ============================================

import { memo, useState } from 'react';
import { Alert, alpha, Box, Button, Card, Chip, CircularProgress, Collapse, Grid2, Stack, TextField, Typography, useTheme } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import type { Project, TechStack } from '@groundwork/types';
import { useAI } from '../../hooks/useAI';
import { MarkdownContent } from '../MarkdownContent';
import { useAppStore } from '../../store';
import { DebouncedTextField } from '../DebouncedTextField';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export const StackSection = memo(function StackSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const ai = useAI();
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const { stack } = project.sections;

  const updateStack = (field: keyof TechStack, value: string) => {
    if (field === 'other') return;
    // Read latest sections from store to prevent stale closure overwrites
    const latestProject = useAppStore.getState().projects.find(p => p.id === project.id);
    const currentSections = latestProject?.sections ?? project.sections;
    onUpdate(project.id, {
      sections: {
        ...currentSections,
        stack: { ...currentSections.stack, [field]: value },
      },
    });
  };

  const [newOtherItem, setNewOtherItem] = useState('');

  const addOtherItem = () => {
    if (!newOtherItem.trim()) return;
    const latestProject = useAppStore.getState().projects.find(p => p.id === project.id);
    const currentSections = latestProject?.sections ?? project.sections;
    const currentOther = currentSections.stack.other ?? [];
    onUpdate(project.id, {
      sections: {
        ...currentSections,
        stack: { ...currentSections.stack, other: [...currentOther, newOtherItem.trim()] },
      },
    });
    setNewOtherItem('');
  };

  const removeOtherItem = (index: number) => {
    const latestProject = useAppStore.getState().projects.find(p => p.id === project.id);
    const currentSections = latestProject?.sections ?? project.sections;
    const currentOther = currentSections.stack.other ?? [];
    onUpdate(project.id, {
      sections: {
        ...currentSections,
        stack: { ...currentSections.stack, other: currentOther.filter((_, i) => i !== index) },
      },
    });
  };

  const handleSuggestStack = async () => {
    const result = await ai.suggestStack(project.description, project.sections.features.map(f => f.name));
    if (result) setAiSuggestion(result);
  };

  const fields = [
    { key: 'frontend' as const, label: 'Frontend', placeholder: 'React, Next.js, Vue...' },
    { key: 'backend' as const, label: 'Backend', placeholder: 'Node.js, Python, Go...' },
    { key: 'database' as const, label: 'Database', placeholder: 'PostgreSQL, MongoDB, SQLite...' },
    { key: 'hosting' as const, label: 'Hosting', placeholder: 'Vercel, Railway, AWS...' },
    { key: 'auth' as const, label: 'Auth', placeholder: 'Supabase Auth, Clerk, Firebase...' },
    { key: 'payments' as const, label: 'Payments', placeholder: 'Stripe, Lemon Squeezy...' },
  ];

  return (
    <Box>
      {/* Section Header */}
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
          <BuildIcon sx={{ color: 'warning.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Tech Stack
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={ai.loading ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
          onClick={handleSuggestStack}
          disabled={ai.loading}
          sx={{ ml: 'auto' }}
        >
          Suggest with AI
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Pick your tools. As a solo dev, go with what you know. Boring tech wins — minimize
        moving parts.
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

      <Card sx={{ p: 3 }}>
        <Grid2 container spacing={3}>
          {fields.map(({ key, label, placeholder }) => (
            <Grid2 size={{ xs: 12, sm: 6 }} key={key}>
              <DebouncedTextField
                label={label}
                placeholder={placeholder}
                fullWidth
                value={stack[key] || ''}
                onChange={(value) => updateStack(key, value)}
              />
            </Grid2>
          ))}
        </Grid2>

        {/* Other Technologies (#7) */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Other Tools & Libraries
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
            {(stack.other ?? []).map((item, i) => (
              <Chip
                key={`${i}-${item}`}
                label={item}
                size="small"
                onDelete={() => removeOtherItem(i)}
                variant="outlined"
              />
            ))}
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Add tool or library..."
              value={newOtherItem}
              onChange={(e) => setNewOtherItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOtherItem()}
              sx={{ flex: 1 }}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addOtherItem}
              disabled={!newOtherItem.trim()}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
});
