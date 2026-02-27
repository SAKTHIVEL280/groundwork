// ============================================
// Groundwork - Tech Stack Section Component
// ============================================

import { alpha, Box, Card, Grid2, TextField, Typography, useTheme } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import type { Project, TechStack } from '@groundwork/types';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export function StackSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { stack } = project.sections;

  const updateStack = (field: keyof TechStack, value: string) => {
    if (field === 'other') return;
    onUpdate(project.id, {
      sections: {
        ...project.sections,
        stack: { ...stack, [field]: value },
      },
    });
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
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Pick your tools. As a solo dev, go with what you know. Boring tech wins — minimize
        moving parts.
      </Typography>

      <Card sx={{ p: 3 }}>
        <Grid2 container spacing={3}>
          {fields.map(({ key, label, placeholder }) => (
            <Grid2 size={{ xs: 12, sm: 6 }} key={key}>
              <TextField
                label={label}
                placeholder={placeholder}
                fullWidth
                value={stack[key] || ''}
                onChange={(e) => updateStack(key, e.target.value)}
              />
            </Grid2>
          ))}
        </Grid2>
      </Card>
    </Box>
  );
}
