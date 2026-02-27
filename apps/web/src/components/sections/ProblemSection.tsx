// ============================================
// Groundwork - Problem Section Component
// ============================================

import { alpha, Box, Card, Stack, TextField, Typography, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { Project } from '@groundwork/types';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export function ProblemSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { problem } = project.sections;

  const updateField = (field: keyof typeof problem, value: string) => {
    onUpdate(project.id, {
      sections: {
        ...project.sections,
        problem: { ...problem, [field]: value },
      },
    });
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
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        What problem are you solving? Be specific. If you can't explain the problem clearly,
        you're not ready to code.
      </Typography>

      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <TextField
            label="Problem Statement"
            placeholder="Users struggle with _____ because _____."
            fullWidth
            multiline
            rows={3}
            value={problem.statement}
            onChange={(e) => updateField('statement', e.target.value)}
          />
          <TextField
            label="Impact"
            placeholder="This costs users _____ (time, money, frustration)."
            fullWidth
            multiline
            rows={2}
            value={problem.impact}
            onChange={(e) => updateField('impact', e.target.value)}
          />
          <TextField
            label="Current Solution"
            placeholder="Today, people solve this by _____, but it's bad because _____."
            fullWidth
            multiline
            rows={2}
            value={problem.currentSolution}
            onChange={(e) => updateField('currentSolution', e.target.value)}
          />
        </Stack>
      </Card>
    </Box>
  );
}
