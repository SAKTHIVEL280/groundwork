// ============================================
// Groundwork - Problem Section Component
// ============================================

import { memo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CircularProgress,
  Collapse,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { Project } from '@groundwork/types';
import { useAI } from '../../hooks/useAI';
import { MarkdownContent } from '../MarkdownContent';
import { useAppStore } from '../../store';
import { DebouncedTextField } from '../DebouncedTextField';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export const ProblemSection = memo(function ProblemSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { problem } = project.sections;
  const ai = useAI();
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const updateField = (field: keyof typeof problem, value: string) => {
    // Read latest sections from store to prevent stale closure overwrites
    const latestProject = useAppStore.getState().projects.find(p => p.id === project.id);
    const currentSections = latestProject?.sections ?? project.sections;
    onUpdate(project.id, {
      sections: {
        ...currentSections,
        problem: { ...currentSections.problem, [field]: value },
      },
    });
  };

  const handleRefineIdea = async () => {
    const idea = `${project.name}. ${project.description}. Problem: ${problem.statement}`;
    const result = await ai.refineIdea(idea);
    if (result) setAiSuggestion(result);
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
            bgcolor: alpha(theme.palette.error.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Define the Problem
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={ai.loading ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
          onClick={handleRefineIdea}
          disabled={ai.loading}
          sx={{ ml: 'auto' }}
        >
          Refine with AI
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        What problem are you solving? Be specific. If you can't explain the problem clearly,
        you're not ready to code.
      </Typography>

      {/* AI Suggestion */}
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
        <Stack spacing={3}>
          <DebouncedTextField
            label="Problem Statement"
            placeholder="Users struggle with _____ because _____."
            fullWidth
            multiline
            rows={3}
            value={problem.statement}
            onChange={(value) => updateField('statement', value)}
          />
          <DebouncedTextField
            label="Impact"
            placeholder="This costs users _____ (time, money, frustration)."
            fullWidth
            multiline
            rows={2}
            value={problem.impact}
            onChange={(value) => updateField('impact', value)}
          />
          <DebouncedTextField
            label="Current Solution"
            placeholder="Today, people solve this by _____, but it's bad because _____."
            fullWidth
            multiline
            rows={2}
            value={problem.currentSolution}
            onChange={(value) => updateField('currentSolution', value)}
          />
        </Stack>
      </Card>
    </Box>
  );
});
