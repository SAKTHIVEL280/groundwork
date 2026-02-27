// ============================================
// Groundwork - Screens Section Component
// ============================================

import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DevicesIcon from '@mui/icons-material/Devices';
import { createScreen } from '@groundwork/logic';
import type { Screen, Project } from '@groundwork/types';

interface Props {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
}

export function ScreensSection({ project, onUpdate }: Props) {
  const theme = useTheme();
  const { screens } = project.sections;
  const [newName, setNewName] = useState('');

  const updateScreens = (updated: Screen[]) => {
    onUpdate(project.id, {
      sections: { ...project.sections, screens: updated },
    });
  };

  const addScreen = () => {
    if (!newName.trim()) return;
    updateScreens([...screens, createScreen(newName.trim())]);
    setNewName('');
  };

  const removeScreen = (id: string) => {
    updateScreens(screens.filter((s) => s.id !== id));
  };

  const updateScreen = (id: string, updates: Partial<Screen>) => {
    updateScreens(screens.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <Box>
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
          <DevicesIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        </Box>
        <Typography variant="h5" fontWeight={600}>
          Screens & Pages
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, pl: 0.5, maxWidth: 600 }}>
        Map out every screen or page in your app. What does the user see and where can they go?
      </Typography>

      <Card sx={{ p: 2.5, mb: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            placeholder="Screen name (e.g. Login, Dashboard, Settings)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addScreen()}
            fullWidth
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={addScreen} sx={{ whiteSpace: 'nowrap' }}>
            Add
          </Button>
        </Stack>
      </Card>

      <Stack spacing={2}>
        {screens.map((screen) => (
          <Card key={screen.id} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Stack spacing={1.5} sx={{ flex: 1, mr: 2 }}>
                <TextField
                  size="small"
                  label="Screen Name"
                  value={screen.name}
                  onChange={(e) => updateScreen(screen.id, { name: e.target.value })}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Description"
                  placeholder="What does this screen do? Key elements?"
                  value={screen.description}
                  onChange={(e) => updateScreen(screen.id, { description: e.target.value })}
                  multiline
                  rows={2}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Section / Flow"
                  placeholder="e.g. Onboarding, Main App, Settings"
                  value={screen.section || ''}
                  onChange={(e) => updateScreen(screen.id, { section: e.target.value })}
                  fullWidth
                />
              </Stack>
              <Tooltip title="Remove screen">
                <IconButton size="small" onClick={() => removeScreen(screen.id)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        ))}
        {screens.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No screens mapped yet. Start listing every page your user will interact with.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
